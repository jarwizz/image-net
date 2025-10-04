# ImageNet Taxonomy Explorer

This test project ingests the [ImageNet taxonomy XML](https://github.com/tzutalin/ImageNet_Utils/blob/master/detection_eval_tools/structure_released.xml), stores it in PostgreSQL, serves it via a minimal ASP.NET Core API, and visualizes it in a React (Vite) frontend.

---

## 🚀 How to Use

### Prepare .env

```bash
cp .env.example .env
```

### Start the app (DB + API + Web)

```bash
docker compose up -d --build
```

### Open the link and use the Application

<http://localhost:5173/>

### What is the complexity of your algorithm (in big O notation)?

N = number of rows
L = average number of segments per path (tree depth)
K = rows in a queried subtree

Whole dataset: O(N\*L)
Subtree only: O(K\*L)
