import React from 'react'
import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="https://github.com/kwdb" target="_blank" rel="noopener noreferrer" aria-label="GitHub">GitHub</a>
          <a href="https://gitee.com/kwdb" target="_blank" rel="noopener noreferrer" aria-label="Gitee">Gitee</a>
          <a href="https://kwdb.openatom.tech" target="_blank" rel="noopener noreferrer" aria-label="社区">KWDB 社区</a>
        </div>
        <small className="footer-copy">© {year} OpenAtom KWDB Community</small>
      </div>
    </footer>
  )
}
