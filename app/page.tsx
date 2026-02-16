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
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const addBookmark = async () => {
    if (!user || !title || !url) return

    const { error } = await supabase.from('bookmarks').insert({
      title,
      url,
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
      <div className={styles.container}>
        <button
          onClick={handleLogin}
          className={`${styles.button} ${styles.login}`}
        >
          Login with Google
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <p className={styles.email}>Logged in as: {user.email}</p>

      <div className={styles.row}>
        <input
          className={styles.input}
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className={styles.input}
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button
          onClick={addBookmark}
          className={`${styles.button} ${styles.add}`}
        >
          Add
        </button>
      </div>

      <div>
        {bookmarks.map((b) => (
  <div key={b.id} className={styles.bookmark}>
    <a href={b.url} target="_blank">
      {b.title}
    </a>

    <button
      onClick={() => deleteBookmark(b.id)}
      className={`${styles.button} ${styles.delete}`}
    >
      Delete
    </button>
  </div>
))}

      </div>

      <button
        onClick={handleLogout}
        className={`${styles.button} ${styles.logout}`}
      >
        Logout
      </button>
    </div>
  )
}
