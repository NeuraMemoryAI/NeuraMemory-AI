param(
    [string]$BaseUrl = "http://localhost:3000",
    [switch]$Verbose,
    [switch]$TestRateLimits
)

$script:Token = ""
$script:TotalTests = 0
$script:PassedTests = 0
$script:FailedTests = 0
$script:LastBody = $null
$script:LastStatus = 0
$Timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

function Write-Header([string]$Title) {
    Write-Host ""
    Write-Host ("=" * 70) -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host ("=" * 70) -ForegroundColor Cyan
    Write-Host ""
}
function Write-Section([string]$Title) {
    Write-Host ""; Write-Host "--- $Title ---" -ForegroundColor Blue; Write-Host ""
}
function Write-TestName([string]$Name) { Write-Host "TEST: $Name" -ForegroundColor Yellow }
function Write-Pass([string]$Msg) {
    $script:PassedTests++; $script:TotalTests++
    Write-Host "  [PASS] $Msg" -ForegroundColor Green
}
function Write-Fail([string]$Msg, [string]$Expected, [string]$Got) {
    $script:FailedTests++; $script:TotalTests++
    Write-Host "  [FAIL] $Msg" -ForegroundColor Red
    Write-Host "    Expected : $Expected" -ForegroundColor Red
    Write-Host "    Got      : $Got" -ForegroundColor Red
}
function Write-Info([string]$Msg) { Write-Host "  INFO: $Msg" -ForegroundColor Cyan }

function Invoke-Api {
    param([string]$Method, [string]$Path, [hashtable]$Body=$null, [hashtable]$FormData=$null)
    $uri = "$BaseUrl$Path"
    $headers = @{}
    if ($script:Token) { $headers["Authorization"] = "Bearer $script:Token" }
    if ($Verbose) { Write-Host "  -> $Method $uri" -ForegroundColor DarkCyan }
    try {
        if ($FormData) {
            $fp = $FormData["filePath"]; $mt = $FormData["mimeType"]
            $curlArgs = @("-s", "-o", "-", "-w", "`n%{http_code}", "-X", "POST")
            if ($script:Token) { $curlArgs += @("-H", "Authorization: Bearer $($script:Token)") }
            $curlArgs += @("-F", "file=@${fp};type=${mt}", $uri)
            $raw = & curl.exe @curlArgs 2>&1
            $lines = ($raw -join "`n") -split "`n"
            $script:LastStatus = [int]($lines[-1].Trim())
            $script:LastBody = ($lines[0..($lines.Length-2)] -join "`n") | ConvertFrom-Json -ErrorAction SilentlyContinue
            return
        }
        $p = @{ Uri=$uri; Method=$Method; Headers=$headers }
        if ($Body) { $p["Body"] = ($Body | ConvertTo-Json -Compress); $p["ContentType"] = "application/json" }
        $r = Invoke-WebRequest @p -ErrorAction Stop
        $script:LastStatus = [int]$r.StatusCode
        $script:LastBody = $r.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
    } catch {
        $resp = $_.Exception.Response
        if ($resp -ne $null) {
            $script:LastStatus = [int]$resp.StatusCode
            try {
                $rd = New-Object System.IO.StreamReader($resp.GetResponseStream())
                $script:LastBody = $rd.ReadToEnd() | ConvertFrom-Json -ErrorAction SilentlyContinue
            } catch { $script:LastBody = $null }
        } else {
            $script:LastStatus = 0; $script:LastBody = $null
            Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    if ($Verbose) { Write-Host "  <- $($script:LastStatus)" -ForegroundColor DarkCyan }
}

function Assert-Status([int]$Expected, [string]$TestName) {
    if ($script:LastStatus -eq $Expected) { Write-Pass "$TestName (HTTP $($script:LastStatus))" }
    else { Write-Fail $TestName "HTTP $Expected" "HTTP $($script:LastStatus)" }
}
function Assert-Field([string]$Field, [string]$Expected, [string]$TestName) {
    $actual = $script:LastBody.$Field
    if ("$actual" -eq $Expected) { Write-Pass "$TestName ($Field=$actual)" }
    else { Write-Fail $TestName "$Field=$Expected" "$Field=$actual" }
}
function Assert-FieldExists([string]$Field, [string]$TestName) {
    $actual = $script:LastBody.$Field
    if ($null -ne $actual) { Write-Pass "$TestName ($Field exists)" }
    else { Write-Fail $TestName "$Field to exist" "$Field is null/missing" }
}

function Test-Preflight {
    Write-Header "PRE-FLIGHT CHECKS"
    Invoke-Api -Method GET -Path "/api/v1/mcp/health"
    if ($script:LastStatus -gt 0) { Write-Pass "Server reachable at $BaseUrl (HTTP $($script:LastStatus))" }
    else { Write-Fail "Server reachable" "HTTP response" "connection refused"; exit 1 }
}

function Test-Auth {
    Write-Section "AUTH ENDPOINTS"
    $email = "test_${Timestamp}@neuramemory.test"; $password = "SecurePass123"

    Write-TestName "POST /api/v1/register -- valid"
    Invoke-Api -Method POST -Path "/api/v1/register" -Body @{ email=$email; password=$password }
    Assert-Status 201 "Register new user"

    Write-TestName "POST /api/v1/login -- valid"
    Invoke-Api -Method POST -Path "/api/v1/login" -Body @{ email=$email; password=$password }
    Assert-Status 200 "Login successful"
    Assert-Field "success" "True" "Login success field"
    Assert-FieldExists "token" "Token present"
    $script:Token = $script:LastBody.token
    Write-Info "Token extracted ($($script:Token.Length) chars)"

    Write-TestName "POST /api/v1/register -- duplicate email"
    Invoke-Api -Method POST -Path "/api/v1/register" -Body @{ email=$email; password=$password }
    Assert-Status 409 "Duplicate email rejected"

    Write-TestName "POST /api/v1/register -- weak password"
    Invoke-Api -Method POST -Path "/api/v1/register" -Body @{ email="weak_${Timestamp}@test.com"; password="weakpassword1" }
    Assert-Status 400 "Weak password rejected"

    Write-TestName "POST /api/v1/login -- wrong password"
    Invoke-Api -Method POST -Path "/api/v1/login" -Body @{ email=$email; password="WrongPass999" }
    Assert-Status 401 "Wrong password rejected"

    Write-TestName "GET /api/v1/me -- authenticated"
    Invoke-Api -Method GET -Path "/api/v1/me"
    Assert-Status 200 "GET /me"
    Assert-Field "success" "True" "/me success field"

    Write-TestName "POST /api/v1/api-key -- generate"
    Invoke-Api -Method POST -Path "/api/v1/api-key"
    Assert-Status 200 "Generate API key"
    Assert-Field "success" "True" "API key success"
    $k = $script:LastBody.data.apiKey
    if ($k) { Write-Info "API key prefix: $($k.Substring(0,[Math]::Min(10,$k.Length)))..." }

    Write-TestName "POST /api/v1/logout"
    Invoke-Api -Method POST -Path "/api/v1/logout"
    Assert-Status 200 "Logout"
}

function Test-MemoryGuards {
    Write-Section "MEMORY ROUTES -- Auth Guard"
    $saved = $script:Token
    $script:Token = ""
    Write-TestName "GET /api/v1/memories -- no token"
    Invoke-Api -Method GET -Path "/api/v1/memories"
    Assert-Status 401 "Rejected without token"
    $script:Token = "invalid.token.here"
    Write-TestName "POST /api/v1/memories/text -- invalid token"
    Invoke-Api -Method POST -Path "/api/v1/memories/text" -Body @{ text="Hello" }
    Assert-Status 401 "Rejected with invalid token"
    $script:Token = $saved
}

function Test-MemoryCrud {
    Write-Section "MEMORY ENDPOINTS (CRUD)"

    Write-TestName "POST /api/v1/memories/text"
    Invoke-Api -Method POST -Path "/api/v1/memories/text" -Body @{ text="My name is Gautam. I love automation and testing." }
    Assert-Status 201 "Create text memory"
    Assert-Field "success" "True" "Text memory success"

    Write-TestName "POST /api/v1/memories/link"
    Invoke-Api -Method POST -Path "/api/v1/memories/link" -Body @{ url="https://httpbin.org/html" }
    Assert-Status 201 "Create link memory"

    Write-TestName "POST /api/v1/memories/document -- txt file"
    $tmp = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "nm_$Timestamp.txt")
    Set-Content -Path $tmp -Value "Temporary test file for document memory."
    Invoke-Api -Method POST -Path "/api/v1/memories/document" -FormData @{ filePath=$tmp; mimeType="text/plain" }
    Assert-Status 201 "Create document memory"
    Remove-Item $tmp -ErrorAction SilentlyContinue

    Write-TestName "GET /api/v1/memories"
    Invoke-Api -Method GET -Path "/api/v1/memories"
    Assert-Status 200 "List memories"
    Assert-FieldExists "data" "Data field present"

    Write-TestName "GET /api/v1/memories?kind=semantic"
    Invoke-Api -Method GET -Path "/api/v1/memories?kind=semantic"
    Assert-Status 200 "Filter by kind"

    Write-TestName "GET /api/v1/memories/stats"
    Invoke-Api -Method GET -Path "/api/v1/memories/stats"
    Assert-Status 200 "Memory stats"
    Assert-Field "success" "True" "Stats success"

    Write-TestName "GET /api/v1/memories/search?q=Gautam"
    Invoke-Api -Method GET -Path "/api/v1/memories/search?q=Gautam"
    Assert-Status 200 "Semantic search"
    Assert-Field "success" "True" "Search success"

    Write-TestName "GET /api/v1/memories/search -- missing q"
    Invoke-Api -Method GET -Path "/api/v1/memories/search"
    Assert-Status 400 "Search rejected without q"

    Invoke-Api -Method GET -Path "/api/v1/memories"
    $mid = $null
    if ($script:LastBody.data -and $script:LastBody.data.Count -gt 0) { $mid = $script:LastBody.data[0].id }

    if ($mid) {
        Write-Info "Using memory id: $mid"
        Write-TestName "PATCH /api/v1/memories/:id"
        Invoke-Api -Method PATCH -Path "/api/v1/memories/$mid" -Body @{ text="Updated memory text." }
        Assert-Status 200 "Update memory"
        Write-TestName "DELETE /api/v1/memories/:id"
        Invoke-Api -Method DELETE -Path "/api/v1/memories/$mid"
        Assert-Status 200 "Delete single memory"
    } else {
        Write-Info "No memory ID -- skipping PATCH/DELETE single-item tests"
    }

    Write-TestName "DELETE /api/v1/memories -- delete all"
    Invoke-Api -Method DELETE -Path "/api/v1/memories"
    Assert-Status 200 "Delete all memories"

    Write-TestName "GET /api/v1/memories -- verify empty"
    Invoke-Api -Method GET -Path "/api/v1/memories"
    $count = if ($script:LastBody.data) { $script:LastBody.data.Count } else { 0 }
    $script:TotalTests++
    if ($count -eq 0) { $script:PassedTests++; Write-Host "  [PASS] Empty after delete (count=0)" -ForegroundColor Green }
    else { $script:FailedTests++; Write-Host "  [FAIL] Expected 0, got $count" -ForegroundColor Red }
}

function Test-McpHealth {
    Write-Section "MCP ENDPOINT"
    Write-TestName "GET /api/v1/mcp/health"
    Invoke-Api -Method GET -Path "/api/v1/mcp/health"
    Assert-Status 200 "MCP health"
    Assert-Field "status" "ok" "MCP status=ok"
}

function Test-RateLimits {
    if (-not $TestRateLimits) { Write-Info "Skipping rate-limit tests (-TestRateLimits to enable)"; return }
    Write-Section "RATE LIMITING"
    Write-TestName "Login 429 after repeated attempts"
    $hit = $false
    for ($i=1; $i -le 30; $i++) {
        Invoke-Api -Method POST -Path "/api/v1/login" -Body @{ email="rate_${i}_${Timestamp}@t.com"; password="Wrong1" }
        if ($script:LastStatus -eq 429) { $hit=$true; break }
    }
    if ($hit) { Write-Pass "Rate limit triggered (HTTP 429)" } else { Write-Fail "Rate limit" "HTTP 429" "No 429 in 30 attempts" }
}

function Write-Summary {
    Write-Header "TEST SUMMARY"
    Write-Host "Total  : $($script:TotalTests)"
    Write-Host "Passed : $($script:PassedTests)" -ForegroundColor Green
    if ($script:FailedTests -eq 0) {
        Write-Host "Failed : 0" -ForegroundColor Green
        Write-Host "ALL TESTS PASSED" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "Failed : $($script:FailedTests)" -ForegroundColor Red
        Write-Host "SOME TESTS FAILED" -ForegroundColor Red
        exit 1
    }
}

Write-Header "NeuraMemory-AI API Test Suite (PowerShell)"
Write-Host "Base URL : $BaseUrl"
Test-Preflight
Test-Auth
Test-MemoryGuards
Test-MemoryCrud
Test-McpHealth
Test-RateLimits
Write-Summary
