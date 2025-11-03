<template>
    <main class="container">
        <header class="head">
            <h1>Blog</h1>
            <input
                v-model="query"
                type="search"
                placeholder="Search posts..."
                class="search"
                aria-label="Search posts"
            />
        </header>

        <section class="list">
            <article
                v-for="post in filtered"
                :key="post.slug"
                class="post"
            >
                <NuxtLink :to="`/blog/${post.slug}`" class="title">
                    {{ post.title }}
                </NuxtLink>
                <p class="meta">{{ formatDate(post.date) }}</p>
                <p class="excerpt">{{ post.excerpt }}</p>
            </article>

            <p v-if="filtered.length === 0" class="empty">No posts found.</p>
        </section>
    </main>
    <NuxtPage />
</template>

<script setup>
import { ref, computed } from 'vue'

definePageMeta({
    title: 'Blog'
})

// Example static posts. Replace with API call or content fetch as needed.
const posts = ref([
    {
        slug: 'welcome',
        title: 'Welcome to the blog',
        date: '2025-01-10',
        excerpt: 'A short introduction to the blog and what to expect.'
    },
    {
        slug: 'nuxt-tips',
        title: 'Nuxt tips and tricks',
        date: '2025-02-05',
        excerpt: 'Handy tips for building apps with Nuxt 3.'
    },
    {
        slug: 'deploying',
        title: 'Deploying your Nuxt app',
        date: '2025-03-20',
        excerpt: 'Simple steps to deploy your Nuxt application.'
    }
])

const query = ref('')

const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return posts.value
    return posts.value.filter(
        p =>
            p.title.toLowerCase().includes(q) ||
            p.excerpt.toLowerCase().includes(q) ||
            p.slug.toLowerCase().includes(q)
    )
})

function formatDate(iso) {
    try {
        return new Date(iso).toLocaleDateString()
    } catch {
        return iso
    }
}
</script>

<style scoped>
.container {
    max-width: 720px;
    margin: 36px auto;
    padding: 0 16px;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    color: #0f172a;
}

.head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
}

h1 {
    margin: 0;
    font-size: 1.75rem;
}

.search {
    margin-left: auto;
    padding: 8px 10px;
    border: 1px solid #e6e9ef;
    border-radius: 6px;
    min-width: 180px;
}

.list {
    display: grid;
    gap: 16px;
}

.post {
    padding: 16px;
    border: 1px solid #eef2f7;
    border-radius: 8px;
    background: #fff;
}

.title {
    font-weight: 600;
    color: #0b5cff;
    text-decoration: none;
    font-size: 1.05rem;
}

.title:hover {
    text-decoration: underline;
}

.meta {
    margin: 6px 0;
    color: #6b7280;
    font-size: 0.9rem;
}

.excerpt {
    margin: 0;
    color: #334155;
}

.empty {
    color: #6b7280;
    text-align: center;
    padding: 28px 0;
}
</style>