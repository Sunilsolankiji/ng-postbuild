# ng-postbuild

> 🛠️ A simple post-build CLI utility for Angular projects to flatten and clean up the `dist/` output directory.

---

## ✨ Features

- Moves files from `dist/<project>/browser/` to `dist/<project>/`
- Renames `index.csr.html` to `index.html`
- Removes the empty `browser` folder
- Automatically detects the default Angular project from `angular.json`

---

## 📦 Installation

### 🔧 As a Global CLI Tool (recommended for manual use)

```bash
npm install -g --save-dev ng-postbuild
```

### After building your Angular app, you can run it directly:

```bash
ng-postbuild
```

### 🛠️ As a Dev Dependency (recommended for automation or CI/CD)

```bash
npm install -g --save-dev ng-postbuild
```

### Then add it to your package.json scripts:

```json
{
  "scripts": {
    "build": "ng build --configuration production",
    "postbuild": "ng-postbuild"
  }
}
```

### Now simply run:

```bash
npm run build && npm run postbuild
```

### ⚙️ CLI Options

| Option              | Description                                                                    | Default                                              |
| ------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| `--out <filename>`  | Specify the name of the output `.tar` archive file.                            | `<defaultProject>.tar`                               |
| `--rename <folder>` | Rename the project folder inside the archive (e.g., rename `my-app` folder).   | Unchanged (original name from angular.json)          |
| `--no-compress`     | Skip creating the `.tar` archive; only moves and cleans up files.              | Compression enabled       |Include `dist/` folder    |
| `--help`            | Display help information and exit.                                             | N/A                                                  |

### 📂 Example Workflow

```bash
ng build --configuration production
ng-postbuild --out build --rename my-app
```

Now your final deployment-ready files will be directly inside dist/project/.

### 📁 Output Before

```css
dist/
└── my-project/
    └── browser/
        ├── main.js
        ├── styles.css
        └── index.csr.html
```

### 📁 Output After

```css
dist/
└── my-project/
    ├── main.js
    ├── styles.css
    └── index.html
```

### ⚙️ Notes

Works with Angular CLI projects

Requires angular.json to be present in the root

Supports workspaces and monorepos by detecting defaultProject

### 📃 License

MIT

### 👨‍💻 Author

Sunil Solanki

Feel free to contribute, suggest improvements, or open issues on GitHub: [`ng-postbuild`](https://github.com/sunilsolankiji/ng-postbuild)
