import React from 'react'
import TextPara from '@/components/TextPara'
import { BackgroundRipple } from '@/components/BackgroundRipple'
import Cards from '@/components/Cards'
import Footer from '@/components/Footer'


const Home = () => {
  return (
    <div>
        <BackgroundRipple />
        <TextPara />
        <Cards />
    </div>
  )
}

export default Home