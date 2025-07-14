import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import Auth from '../components/Auth'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI powered project management for remote teams
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              AI powered project management for remote teams
            </p>
          </div>
          <Auth />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>AI powered project management for remote teams</title>
        <meta name="description" content="AI powered project management for remote teams" />
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to AI powered project management for remote teams
          </h1>
          <p className="text-lg text-gray-600">
            Hello {user.email}! Your application is ready to customize.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Get Started</h3>
            <p className="text-gray-600 mb-4">
              Customize your dashboard and add your core features.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Customize
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Add Features</h3>
            <p className="text-gray-600 mb-4">
              Build out your core functionality and user workflows.
            </p>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Build
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Deploy</h3>
            <p className="text-gray-600 mb-4">
              Ready to launch? Deploy your app to production.
            </p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Deploy
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}