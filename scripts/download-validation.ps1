$ErrorActionPreference = 'Stop'
if (-not (Test-Path artifacts/commons-receipts.json)) {
 New-Item -ItemType Directory -Force artifacts | Out-Null
 Invoke-WebRequest -Uri 'https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle=Category%3AShop_receipts&gcmtype=file&gcmlimit=50&prop=imageinfo&iiprop=url%7Csize%7Cextmetadata&format=json' -OutFile artifacts/commons-receipts.json
}
$catalog = Get-Content artifacts/commons-receipts.json -Raw | ConvertFrom-Json
$names = @(
 '20140409 Dresden Dobritz Salzbuger Straße Nettomarkt Einkaufszettel.jpg',
 'Castorama Wroclaw Krzywoustego receipt 2021.jpg',
 'CRO — Istria – Umag (cash receipt Pivo Točeno) 2020.JPG',
 'Family Dollar store receipt.jpg',
 'Kassenbon.jpg',
 'Malmo & Co receipt, 1899 (MOHAI 11884).jpg',
 'Receipt from Lawson in South Tangerang, Indonesia with QRIS CPM (2025-09-02).jpg',
 'Thalhammer Kaufhaus Altaussee Kassazettel 19630711.jpg',
 '0B83181C-3DCA-4008-837D-5ED65hdekkektguufnvnnf.jpg',
 'Tesco receipt,Easby Wood - geograph.org.uk - 176290.jpg'
)
New-Item -ItemType Directory -Force public/validation | Out-Null
$records = @()
for ($index = 0; $index -lt $names.Count; $index++) {
 $page = $catalog.query.pages.psobject.Properties.Value | Where-Object title -eq ('File:' + $names[$index])
 if (-not $page) { throw "Missing source: $($names[$index])" }
 $info = $page.imageinfo[0]
 $extension = [IO.Path]::GetExtension($names[$index]).ToLower()
 $id = 'receipt-{0:d2}' -f ($index + 1)
 $path = "public/validation/$id$extension"
 if (-not (Test-Path $path) -or (Get-Item $path).Length -ne $info.size) {
  for ($attempt = 0; $attempt -lt 4; $attempt++) {
   try { Invoke-WebRequest -Uri $info.url -OutFile $path -Headers @{'User-Agent'='InvariantLens/0.1 (research)'}; break }
   catch { if ($attempt -eq 3) { throw 'Download failed after bounded retries' }; Start-Sleep -Seconds (10 * ($attempt + 1)) }
  }
  Start-Sleep -Seconds 3
 }
 $records += [ordered]@{id=$id; title=$names[$index]; path=$path; url="/validation/$id$extension"; source=$info.descriptionurl; downloadUrl=$info.url; authorHtml=$info.extmetadata.Artist.value; license=$info.extmetadata.LicenseShortName.value; licenseUrl=$info.extmetadata.LicenseUrl.value; width=$info.width; height=$info.height; bytes=(Get-Item $path).Length; sha256=(Get-FileHash $path -Algorithm SHA256).Hash.ToLower(); modifications='None; original downloaded bytes'; status='untested'; downloadedAt=[DateTime]::UtcNow.ToString('o')}
 [IO.File]::WriteAllText((Join-Path $PWD 'public/validation/manifest.json'), ($records | ConvertTo-Json -Depth 8))
 Write-Output "$id downloaded ($($info.size) bytes)"
}
[IO.File]::WriteAllText((Join-Path $PWD 'public/validation/manifest.json'), ($records | ConvertTo-Json -Depth 8))


