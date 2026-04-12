# TanStack Start — Routing & Server Functions Reference

## File-based routing conventions

TanStack Start uses `src/routes/` with the following conventions:

| File | Route |
|---|---|
| `routes/__root.tsx` | Root layout (wraps all routes) |
| `routes/index.tsx` | `/` |
| `routes/about.tsx` | `/about` |
| `routes/posts/$postId.tsx` | `/posts/:postId` |
| `routes/posts/index.tsx` | `/posts` |
| `routes/_layout.tsx` | Layout route (no path segment) |
| `routes/_layout/page.tsx` | `/page` inside layout |

## Root route

```tsx
// src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
    </>
  ),
})
```

## Index route

```tsx
// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => <div>Home</div>,
})
```

## Dynamic route

```tsx
// src/routes/posts/$postId.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  component: PostPage,
})

function PostPage() {
  const { postId } = Route.useParams()
  return <div>Post: {postId}</div>
}
```

## Loader (server-side data)

```tsx
export const Route = createFileRoute('/posts')({
  loader: async () => {
    const posts = await fetchPosts()
    return { posts }
  },
  component: PostsPage,
})

function PostsPage() {
  const { posts } = Route.useLoaderData()
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}
```

## Server functions (createServerFn)

```ts
// src/server/posts.ts
import { createServerFn } from '@tanstack/start'

export const getPosts = createServerFn().handler(async () => {
  // runs on server only
  return db.query('SELECT * FROM posts')
})
```

Call from client:
```ts
const posts = await getPosts()
```

## TanStack Query + Loader pattern

Prefer loaders for initial data, Query for subsequent fetches/mutations:

```tsx
export const Route = createFileRoute('/posts')({
  loader: () => queryClient.ensureQueryData(postsQueryOptions),
  component: PostsPage,
})

function PostsPage() {
  const { data: posts } = useSuspenseQuery(postsQueryOptions)
  // ...
}
```

## Navigation

```tsx
import { Link, useNavigate } from '@tanstack/react-router'

// Declarative
<Link to="/posts/$postId" params={{ postId: '1' }}>View post</Link>

// Imperative
const navigate = useNavigate()
navigate({ to: '/posts', search: { page: 2 } })
```
