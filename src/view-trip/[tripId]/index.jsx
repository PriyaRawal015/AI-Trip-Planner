import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner';
import InfoSection from './components/InfoSection';
import { db } from '@/service/firebaseConfig';
import Hotels from './components/Hotels';
import PlacesToVisit from './components/PlacesToVisit';
import Footer from './components/Footer';
import RelatedTrips from './components/RelatedTrips';
import TransportOptions from './components/TransportOptions';

function Viewtrip() {
    const {tripId}=useParams();
    const [trip, setTrip]=useState([]);

    useEffect(()=>{
        tripId&&GetTripData();
    },[tripId])

    const GetTripData=async()=>{
        const docRef=doc(db,'AITrip',tripId);
        const docSnap=await getDoc(docRef);

        if(docSnap.exists()){
            console.log("Document:",docSnap.data());
            setTrip(docSnap.data());
        }
        else{
            console.log("No such Document");
            toast('No trip Found!')
        }
    }

  return (
    <div className='p-10 md:px-20 lg:px-44 xl:px-56'>
        {/* Information section */}
        <InfoSection trip={trip} />

        {/* Recommended Hotels */}
        <Hotels trip={trip}/>

        {/* Travel Options */}
        <TransportOptions trip={trip}/>

        {/* Daily Plan  */}
        <PlacesToVisit trip={trip}/>

        {/* Related trips ML section  */}
        <RelatedTrips trip={trip}/>

        {/* Footer  */}
        <Footer trip={trip}/>
    </div>
  )
}

export default Viewtrip
