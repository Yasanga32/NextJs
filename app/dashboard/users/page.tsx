import Link from 'next/link'
import React from 'react'

function page() {
  return (
    <div>
        <h1>Dashboard Users</h1>
        <ul className='mt-10'>
            <li><Link href="/dashboard/users/1">user 1</Link></li>
            <li><Link href="/dashboard/users/2">user 2</Link></li>
            <li><Link href="/dashboard/users/3">user 3</Link></li>
            <li><Link href="/dashboard/users/4">user 4</Link></li>
        </ul> 
        
    </div>
  )
}

export default page