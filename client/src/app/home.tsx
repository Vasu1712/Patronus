"use client";

import React, { useState } from 'react';
import Image from "next/image"; 
import logo from "./images/PatronusLogo.png"; 
import Select, { components } from 'react-select';
import { Icon } from '@iconify/react';
import { airportOptions } from './assets/airportCodes.js'; 
import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css';
import '../styles/calendarStyles.css';
import { databases, ID, account, functions } from './appwrite';


const Home: React.FC = () => {
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [passengers, setPassengers] = useState(1);
    const [showCounter, setShowCounter] = useState(false);
    const [selectedDates, setSelectedDates] = useState<[Date | null, Date | null]>([null, null]);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());  

    
    const handleGetFlights = async () => {
        if (!fromLocation || !toLocation || !selectedDates[0] || !selectedDates[1]) {
            alert('Please fill in the required fields.');
            return;
        }
    
        const flightDetails = {
            fromLocation,
            toLocation,
            departureDate: selectedDates[0].toLocaleDateString('en-GB'),
            arrivalDate: selectedDates[1].toLocaleDateString('en-GB'),
            passengers,
        };
    
        try {
            // Get the logged-in user
            const user = await account.get();
            const userEmail = user.email;
    
            const flightDetailsWithUser = {
                ...flightDetails,
                userEmail,  
            };
    
            // Create document in Appwrite database
            const document = await databases.createDocument(
                '670d6cf40006f6102f3c',  // Database ID
                '670d6d030007cc158b32',  // Collection ID
                ID.unique(),             // Auto-generate document ID
                flightDetailsWithUser     // Flight details + user email
            );
    
            const documentId = document.$id; // Retrieve the document ID
    
            // Call Appwrite function with the documentId and userEmail
            const functionResponse = await functions.createExecution(
                'your-function-id',      // Replace with your actual Appwrite function ID
                JSON.stringify({
                    documentId,
                    userEmail
                })
            );
    
            const responseData = JSON.parse(functionResponse.response);
            if (responseData.ok) {
                alert('Flight details saved and processed successfully!');
                console.log('AI Response:', responseData.aiResponse);
            } else {
                alert('Failed to process flight details');
            }
    
        } catch (error) {
            console.error('Error saving or processing flight details:', error);
            alert('Failed to save or process flight details');
        }
    };
    
    
    

    const handleSwap = () => {
        let temp = fromLocation;
        setFromLocation(toLocation);
        setToLocation(temp);
    };

    const FromDropdownIndicator = (props: any) => (
        <components.DropdownIndicator {...props}>
            <Icon icon="material-symbols-light:flight-takeoff" className="text-lavender" width={20} />
        </components.DropdownIndicator>
    );
    
    const ToDropdownIndicator = (props: any) => (
        <components.DropdownIndicator {...props}>
            <Icon icon="material-symbols-light:flight-land" className="text-lavender" width={20} />
        </components.DropdownIndicator>
    );

    const handleDateChange = (dates: [Date | null, Date | null]) => {
        setSelectedDates(dates);
    };

    const handleIncreasePassengers = () => {
        if (passengers < 9) { 
            setPassengers(passengers + 1);
            setShowCounter(true);  
        }
    };

    const handleDecreasePassengers = () => {
        if (passengers > 1) { 
            setPassengers(passengers - 1);
            setShowCounter(true);
        }
    };

    const formatDate = (date: Date | null): string => {
        if (!date) return 'N/A';
        return date.toLocaleDateString('en-GB');
    };

    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);

    return (
        <div className="flex h-screen bg-gradient-to-tl from-bg1 via-bg2 to-bg1">
            <button className="absolute top-4 right-4 bg-purple text-white py-2 px-4 rounded-full hover:bg-violet-800 transition flex gap-1">
                <span>Logout</span>
                <Icon icon="tabler:logout" width="20" className="my-auto" />
            </button>
            <div className="w-1/5 flex flex-col gap-8 items-center justify-center">
                <Image
                    src={logo} 
                    width={300}  
                    alt="Patronus Logo"
                    className="w-3/4 h-auto"
                />
                <button className="bg-purple text-white py-2 px-4 rounded-full">Booking History</button>
            </div>

            {/* Right Side */}
            <div className="w-4/5 flex flex-col items-center justify-center gap-16">  
                <div className='w-1/2 flex justify-evenly items-center gap-2 pl-4'>
                    <div className='w-2/5'>
                    <Select
                        options={airportOptions}
                        value={fromLocation ? { value: fromLocation, label: fromLocation } : null}
                        onChange={(selectedOption) => setFromLocation(selectedOption?.value || '')}
                        placeholder="From"
                        classNamePrefix="react-select"
                        isClearable
                        components={{ DropdownIndicator: FromDropdownIndicator, IndicatorSeparator: () => null }} 
                        styles={{
                            control: (provided, state) => ({
                                ...provided,
                                backgroundColor: 'inherit', 
                                borderColor: '#B1B1F8', 
                                padding: '2px',
                                borderWidth: '1px',
                                borderRadius: '8px',
                                boxShadow: state.isFocused ? '0 0 0 1px #B1B1F8' : 'none', 
                                '&:hover': {
                                    borderColor: '#B1B1F8',
                                },
                            }),
                            placeholder: (provided) => ({
                                ...provided,
                                color: '#B1B1F8',  
                            }),
                            menu: (provided) => ({
                                ...provided,
                                backgroundColor: '#040e1b',
                                opacity: '90%',
                                color: '#040e1b',
                            }),
                            option: (provided, state) => ({
                                ...provided,
                                backgroundColor: state.isFocused
                                    ? '#6A49E2'  
                                    : state.isSelected
                                    ? '#040e1b'  
                                    : 'inherit',
                                color: state.isFocused
                                    ? 'white'  
                                    : state.isSelected
                                    ? '#B1B1F8' 
                                    : '#B1B1F8',
                                '&:hover': {
                                    backgroundColor: '#6A49E2',  
                                    color: 'white', 
                                },
                            }),
                            singleValue: (provided) => ({
                                ...provided,
                                color: '#B1B1F8',
                                fontWeight: '600',
                            }),
                            dropdownIndicator: (provided) => ({
                                ...provided,
                                color: '#B1B1F8', 
                            }),
                        }}
                    />
                    </div>
                    <button
                        className='flex items-center justify-center p-1 bg-bg2 rounded-full w-8 h-8 z-2'
                        onClick={handleSwap}
                        tabIndex={-1}>
                        <Icon
                            icon='tdesign:swap'
                            width={24}
                            className='text-lavender'
                        />
                    </button>
                    <div className='w-2/5'>
                        <Select
                            options={airportOptions}
                            value={toLocation ? { value: toLocation, label: toLocation } : null}
                            onChange={(selectedOption) => setToLocation(selectedOption?.value || '')}
                            placeholder="To"
                            classNamePrefix="react-select"
                            isClearable
                            components={{ DropdownIndicator: ToDropdownIndicator, IndicatorSeparator: () => null }}  
                            styles={{
                                control: (provided, state) => ({
                                    ...provided,
                                    backgroundColor: 'inherit',
                                    borderColor: '#B1B1F8', 
                                    borderWidth: '1px',
                                    borderRadius: '8px',
                                    padding: '2px',
                                    boxShadow: state.isFocused ? '0 0 0 1px #B1B1F8' : 'none', 
                                    '&:hover': {
                                        borderColor: '#B1B1F8', 
                                    },
                                }),
                                placeholder: (provided) => ({
                                    ...provided,
                                    color: '#B1B1F8',  
                                }),
                                menu: (provided) => ({
                                    ...provided,
                                    backgroundColor: '#040e1b',
                                    opacity: '90%',
                                    color: '#040e1b',
                                }),
                                option: (provided, state) => ({
                                    ...provided,
                                    backgroundColor: state.isFocused
                                        ? '#6A49E2'  
                                        : state.isSelected
                                        ? '#040e1b' 
                                        : 'inherit',
                                    color: state.isFocused
                                        ? 'white'  
                                        : state.isSelected
                                        ? '#B1B1F8'  
                                        : '#B1B1F8',
                                    '&:hover': {
                                        backgroundColor: '#6A49E2',   
                                        color: 'white', 
                                    },
                                }),
                                singleValue: (provided) => ({
                                    ...provided,
                                    color: '#B1B1F8',
                                    fontWeight: '600',
                                }),
                                dropdownIndicator: (provided) => ({
                                    ...provided,
                                    color: '#B1B1F8', 
                                }),
                            }}
                        />
                    </div>
                    {/* Passengers */}
                    <div className="w-1/5 flex gap-1 ml-4">
                        {!showCounter ? (
                            <div className="flex items-center gap-3 px-2 py-1 border border-lavender rounded-lg">
                                <Icon
                                    icon='solar:minus-circle-bold-duotone'
                                    className='text-lavender cursor-pointer'
                                    width={20}
                                    onClick={handleDecreasePassengers}
                                />
                                <Icon
                                    icon='material-symbols:person'
                                    className='text-lavender cursor-pointer'
                                    width={24}
                                />
                                <Icon
                                    icon='lets-icons:add-duotone'
                                    className='text-lavender cursor-pointer'
                                    width={20}
                                    onClick={handleIncreasePassengers}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 px-2 py-1 border border-lavender rounded-lg">
                                
                                <Icon
                                    icon='solar:minus-circle-bold-duotone'
                                    className='text-lavender cursor-pointer'
                                    width={20}
                                    onClick={handleDecreasePassengers}
                                />
                                <span className='text-white text-lg font-semibold'>
                                    {passengers}
                                </span>
                                <Icon
                                    icon='lets-icons:add-duotone'
                                    className='text-lavender cursor-pointer'
                                    width={20}
                                    onClick={handleIncreasePassengers}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-2/4 p-4 mt-2 rounded-xl flex flex-col gap-4 bg-graybg">
                    <div className="rounded-xl flex gap-8 bg-graybg">
                        {/* First Calendar (Current Month) */}
                        <Calendar 
                            selectRange={true}
                            onChange={handleDateChange}
                            value={selectedDates}
                            minDate={new Date()} 
                            className='calendar'
                            onActiveStartDateChange={({ activeStartDate }) => setCurrentMonth(activeStartDate!)}
                        />
                        <div className='w-[0.2px] mt-8 h-full bg-zinc-700'></div>
                        {/* Second Calendar (Next Month) */}
                        <Calendar 
                            selectRange={true}
                            onChange={handleDateChange}
                            value={selectedDates}
                            minDate={new Date()} 
                            className='calendar'
                            activeStartDate={nextMonth} 
                        />
                    </div>
                    <div className='w-full h-[0.2px] mt-4 bg-zinc-700'></div>
                    <div className='flex justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='bg-lightgray font-medium text-base rounded-lg py-1 px-4 tracking-wide'>
                                {formatDate(selectedDates[0])}
                            </div>
                            <Icon icon='basil:arrow-right-solid' color='#525254' className='cursor-pointer' width={24} />
                            <div className='bg-inherit font-medium text-base tracking-wide rounded-lg border border-purple py-1 px-4'>
                                {formatDate(selectedDates[1])}
                            </div>
                        </div>
                        <div className='flex items-center gap-3'>
                            <button className='bg-lightgray rounded-lg py-1 px-4' onClick={() => setSelectedDates([null, null])}>
                                Cancel
                            </button>
                            <button className='bg-purple font-semibold rounded-lg py-1 px-4' > 
                                Set Date
                            </button>
                        </div>
                    </div>
                </div>
                <div className='mt-4 flex justify-center'>
                    <button
                        className='flex flex-row gap-2 text-white px-6 py-2 bg-purple rounded-full  hover:shadow-xl hover:scale-105'
                        onClick={handleGetFlights}>
                        Get Flights
                        <Icon
                            icon='material-symbols-light:flight-takeoff'
                            className=''
                            color='white'
                            width='20'
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
