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
    // await supabase.auth.signInWithOAuth({ provider: 'google' })
//     await supabase.auth.signInWithOAuth({
//   provider: 'google',
//   options: {
//     redirectTo: window.location.origin,
//   },
// })
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


  // return (
//     <div className={styles.container}>
//       <p className={styles.email}>Logged in as: {user.email}</p>

//       <div className={styles.row}>
//         <input
//           className={styles.input}
//           placeholder="Title"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//         />

//         <input
//           className={styles.input}
//           placeholder="URL"
//           value={url}
//           onChange={(e) => setUrl(e.target.value)}
//         />

//         <button
//           onClick={addBookmark}
//           className={`${styles.button} ${styles.add}`}
//         >
//           Add
//         </button>
//       </div>

//       <div>
//         {bookmarks.map((b) => (
//   <div key={b.id} className={styles.bookmark}>
//     <a href={b.url} target="_blank">
//       {b.title}
//     </a>

//     <button
//       onClick={() => deleteBookmark(b.id)}
//       className={`${styles.button} ${styles.delete}`}
//     >
//       Delete
//     </button>
//   </div>
// ))}

//       </div>

//       <button
//         onClick={handleLogout}
//         className={`${styles.button} ${styles.logout}`}
//       >
//         Logout
//       </button>
//     </div>
//   )
// }
return (
  <div className={styles.page}>
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>Smart Bookmark</div>
        <div className={styles.subtitle}>{user.email}</div>
      </div>

      <div className={styles.row}>
        <input
          className={styles.input}
          placeholder="Bookmark title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className={styles.input}
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={addBookmark} className={styles.addBtn}>
          Add
        </button>
      </div>

      {bookmarks.length === 0 && (
        <div className={styles.empty}>No bookmarks yet</div>
      )}

      {bookmarks.map((b) => (
        <div key={b.id} className={styles.bookmark}>
          <a href={b.url} target="_blank" className={styles.link}>
            <span className={styles.linkTitle}>{b.title}</span>
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

      <button onClick={handleLogout} className={styles.logout}>
        Logout
      </button>
    </div>
  </div>
)

}