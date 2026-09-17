$ProgressPreference = "SilentlyContinue"
$base = "http://localhost:3000"
foreach ($u in @(
  "/admin-dashboard",
  "/admin-dashboard/users",
  "/admin-dashboard/signed-users",
  "/admin-dashboard/risk-profiles",
  "/admin-dashboard/agreements",
  "/admin-dashboard/invoices",
  "/admin-dashboard/payments",
  "/admin-dashboard/subscriptions",
  "/admin-dashboard/plans",
  "/admin-dashboard/coupons",
  "/admin-dashboard/analytics",
  "/admin-dashboard/messages",
  "/admin-dashboard/complaints",
  "/admin-plans",
  "/admin-coupons",
  "/admin-analytics",
  "/admin-payment-audit",
  "/admin-subscriptions",
  "/admin-plan-details"
)) {
  try {
    $r = Invoke-WebRequest -Uri ($base + $u) -UseBasicParsing -MaximumRedirection 0 -ErrorAction Stop
    Write-Output ("{0} -> {1}" -f $u, $r.StatusCode)
  } catch {
    $resp = $_.Exception.Response
    if ($resp) {
      Write-Output ("{0} -> {1}" -f $u, [int]$resp.StatusCode)
    } else {
      Write-Output ("{0} -> ERR" -f $u)
    }
  }
}