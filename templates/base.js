module.exports = (render, model) => render`
<!doctype html>
<html>
  <head>
    <title>${model.title} | Razvan Caliman</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="build/style.css">
    ${ model.style }
  </head>

  <body>
    <main>
      ${model.content}
    </main>

    <footer>
      <script src="build/script.js" type="module"></script>
      <script src="build/script-legacy.js" nomodule></script>
    </footer>
  </body>
</html>
`;
