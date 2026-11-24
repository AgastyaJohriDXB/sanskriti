#!/bin/sh
# Prints an empty page skeleton. Usage: sh tools/skeleton.sh > newpage.html  (then add it to PAGES in build-partials.mjs)
cat <<'HTML'
<!doctype html>
<html lang="en">
<head>
<!-- @head --><!-- /@head -->
</head>
<body>
<!-- @header --><!-- /@header -->
<main id="main">
</main>
<!-- @footer --><!-- /@footer -->
</body>
</html>
HTML
