'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import styles from './page.module.css'

type Bookmark = {
  id: string
  title: string
  url: string
  user_id: string
  created_at: string
}

export default function Home() {
  const [error, setError] = useState('')

  const [user, setUser] = useState<User | null>(null)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useEffect(() => {
    const initUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)

      if (data.user) {
        fetchBookmarks()
      }
    }

    initUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchBookmarks()
        } else {
          setBookmarks([])
        }
      }
    )
    const channel = supabase
  .channel('bookmarks-realtime')
  .on(
    'postgres_changes',
    {
      event: '*', // listen to INSERT, DELETE, UPDATE
      schema: 'public',
      table: 'bookmarks',
    },
    () => {
      fetchBookmarks()
    }
  )
  .subscribe()


    return () => {
      listener.subscription.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [])

  const normalizeUrl = (raw: string) => {
  if (!raw) return null

  let url = raw.trim()

  // auto add https if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  try {
    const parsed = new URL(url)

    // reject if hostname has no dot (e.g. "abc")
    if (!parsed.hostname.includes('.')) return null

    return parsed.href
  } catch {
    return null
  }
}



  const deleteBookmark = async (id: string) => {
  const { error } = await supabase.from('bookmarks').delete().eq('id', id)

  if (!error) {
    fetchBookmarks()
  }
}

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBookmarks(data)
    }
  }

  const handleLogin = async () => {
  
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin,
  },
})

  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // const addBookmark = async () => {
  //   if (!user || !title || !url) return

  //   const { error } = await supabase.from('bookmarks').insert({
  //     title,
  //     url,
  //     user_id: user.id,
  //   })

  //   if (!error) {
  //     setTitle('')
  //     setUrl('')
  //     fetchBookmarks()
  //   }
  // }
  const addBookmark = async () => {
 if (!user || !title.trim() || !url.trim()) return


  const validUrl = normalizeUrl(url)

  if (!validUrl) {
    setError('Please enter a valid URL')
    return
  }

  setError('')

  const { error } = await supabase.from('bookmarks').insert({
    title,
    url: validUrl,
    user_id: user.id,
  })

  if (!error) {
    setTitle('')
    setUrl('')
      fetchBookmarks() 
  }
}


  if (!user) {
  return (
    <div className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>Smart Bookmark</h1>

        <p className={styles.heroSubtitle}>
          A simple, private place to keep all your important links.
        </p>

        <button onClick={handleLogin} className={styles.heroButton}>
          Continue with Google
        </button>
      </div>
    </div>
  )
}

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    addBookmark()
  }
}

 
return (
  <div className={styles.appPage}>
    {/* Top Header */}
    <div className={styles.topBar}>
      <div className={styles.brand}>Smart Bookmark</div>

      <button onClick={handleLogout} className={styles.logoutBtn}>
        Logout
      </button>
    </div>

    {/* Input Section */}
    <div className={styles.inputSection}>
      <input
        className={styles.input}
        placeholder="Bookmark title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
      />

      <input
        className={styles.input}
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
      />

      <button onClick={addBookmark} className={styles.addBtn}>
        Add Bookmark
      </button>
      {error && <div className={styles.error}>{error}</div>}

    </div>

    {/* Bookmark List */}
    <div className={styles.list}>
      {bookmarks.length === 0 && (
        <div className={styles.empty}>No bookmarks yet</div>
      )}

      {bookmarks.map((b) => (
        <div key={b.id} className={styles.bookmarkItem}>
          <a href={b.url} target="_blank" className={styles.link}>
            <span className={styles.titleText}>{b.title}</span>
            <span className={styles.domain}>
              {new URL(b.url).hostname.replace('www.', '')}
            </span>
          </a>

          <button
            onClick={() => deleteBookmark(b.id)}
            className={styles.delete}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  </div>
)


}