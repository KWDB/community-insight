import React from 'react'
import { loadManifest } from '@/lib/serverManifest'
import HomeClient from '@/components/HomeClient'

export default function HomePage() {
  const manifest = loadManifest()
  return <HomeClient manifest={manifest} />
}
