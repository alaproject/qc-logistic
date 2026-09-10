qc-logistic/
|
|-- index.html                 # Shell SPA: login, dashboard, form, detail modal, manifest container
|-- css/
|   |-- style.css              # Theme, layout global, responsive base
|   `-- components.css         # Form, card, badge, modal, table, manifest styles
|-- js/
|   |-- app.js                 # Bootstrap, navigation antar view, event wiring, submit flow
|   |-- auth.js                # Hardcoded admin login, session localStorage, logout
|   |-- form.js                # Dynamic item rows, item collection, reset form
|   |-- dashboard.js           # CRUD localStorage, statistics, search/filter, history cards
|   `-- pdf-generator.js       # Manifest A4 dan download PDF via html2pdf.js
`-- assets/                    # Disiapkan untuk logo/aset brand berikutnya

Tech stack:
- HTML5, CSS3, JavaScript Vanilla ES Modules
- Tailwind CSS CDN untuk utility layout
- Google Material Icons Round untuk ikon
- html2pdf.js CDN untuk ekspor manifes A4
- localStorage sebagai penyimpanan MVP lokal

Credential MVP:
- Username: admin
- Password: qc12345
