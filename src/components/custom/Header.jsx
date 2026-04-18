import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { FcGoogle } from "react-icons/fc";

import { googleLogout, useGoogleLogin } from '@react-oauth/google'
import { useNavigation } from 'react-router-dom'
import axios from 'axios';


function Header() {

  const user=JSON.parse(localStorage.getItem('user'))
  const [openDialog, setOpenDialog]=useState(false);
  

  useEffect(()=>{
console.log(user)
  },[])

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Login successful:", tokenResponse);
      GetUserProfile(tokenResponse); // Call GetUserProfile with the token response
    },
    onError: (error) => console.error("Login failed:", error),
  });

  const GetUserProfile = (tokenInfo) => {
    axios
      .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`, {
        headers: {
          Authorization: `Bearer ${tokenInfo?.access_token}`,
          Accept: 'application/json',
        },
      })
      .then((response) => {
        console.log("User profile:", response.data); // Log user data
        localStorage.setItem('user', JSON.stringify(response.data));
        setOpenDialog(false);
        window.location.reload();
      })
      .catch((error) => {
        console.error("Failed to fetch user profile:", error);
        window.location.reload();
      });
  };

  return (
    <div className='p-3 shadow-sm flex justify-between items-center px-5'>
<img
        src="/logo1.png"
        alt="App Logo"
        className="h-20 object-contain cursor-pointer"
        onClick={() => (window.location.href = '/')} 
      />     
      
        <div>
        {user?
        <div className='flex items-center gap-3'>
          <a href='/create-trip'>
          <Button variant="outline" className="rounded-full">+ Create Trip</Button>
          </a>
          <a href='/my-trips'>
          <Button variant="outline" className="rounded-full">My Trips</Button>
          </a>
          <Popover>
          <PopoverTrigger>
          <img src={user?.picture}className='h-[35px] w-[35px] rounded-full' />
         </PopoverTrigger>
  <PopoverContent><h2 className='cursor-pointer' onClick={()=>{
    googleLogout();
    localStorage.clear();
    window.location.reload();
  }}>LogOut</h2></PopoverContent>
</Popover>

        </div>:
        <Button onClick={()=>setOpenDialog(true)}>Sign In</Button>
        }
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogDescription>
        <img src="/logo1.png" className="h-10 w-auto mb-4"/>
        <h2 className='font-bold text-lg mt-7'>Sign In with Google</h2>
        <p>Sign In to the App with Google authentication securely</p>

        <Button onClick={login} className="w-full mt-5 flex gap-4 items-center"> <FcGoogle className='h-7 w-7'/> Sign In With Google </Button> 
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
    </div>
  )
}

export default Header
