import React, { useState } from 'react';
import './RoomBooking.css';

const roomsData: number[][] = [
    [101, 102, 103, 104, 105, 106, 107, 108, 109, 110],
    [201, 202, 203, 204, 205, 206, 207, 208, 209, 210],
    [301, 302, 303, 304, 305, 306, 307, 308, 309, 310],
    [401, 402, 403, 404, 405, 406, 407, 408, 409, 410],
    [501, 502, 503, 504, 505, 506, 507, 508, 509, 510],
    [601, 602, 603, 604, 605, 606, 607, 608, 609, 610],
    [701, 702, 703, 704, 705, 706, 707, 708, 709, 710],
    [801, 802, 803, 804, 805, 806, 807, 808, 809, 810],
    [901, 902, 903, 904, 905, 906, 907, 908, 909, 910],
    [1001, 1002, 1003, 1004, 1005, 1006, 1007],
];

type Booking = {
    room: number;
    type: 'manual' | 'random';
};

const RoomBooking: React.FC = () => {
    const flatRooms = roomsData.flat();
    const [selectedNoOfRooms, setSelectedNoOfRooms] = useState<number>();
    const [selectRoomsError, setSelectedRoomsError] = useState<string>();
    const [bookedRooms, setBookedRooms] = useState<Booking[]>([]);

    const onInputRoomsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedRoomsError('')
        if (Number.parseInt(e.target.value)!==null || Number.parseInt(e.target.value)!==undefined) {
            if (Number.parseInt(e.target.value)<=0 || Number.parseInt(e.target.value)>5) {
                setSelectedRoomsError('You can book minimum of 1, maximum of 5 rooms')
            }
        }
        setSelectedNoOfRooms(Number.parseInt(e.target.value));
    };

    const getFloor = (room: number) => Math.floor(room / 100);
    const getRoomIndexOnFloor = (room: number) => room % 100 - 1;

    const bookRooms = () => {
        if (!selectedNoOfRooms || selectedNoOfRooms<=0 || selectedNoOfRooms>5) return;

        const alreadyBooked = bookedRooms.map((b) => b.room);
        const available = flatRooms.filter((r) => !alreadyBooked.includes(r));

        const roomsByFloor: Record<number, number[]> = {};
        for (const room of available) {
            const floor = getFloor(room);
            if (!roomsByFloor[floor]) roomsByFloor[floor] = [];
            roomsByFloor[floor].push(room);
        }

        let bestCombo: number[] = [];

        // 1. Try consecutive rooms on same floor
        for (const floorStr in roomsByFloor) {
            const floor = parseInt(floorStr);
            const sorted = roomsByFloor[floor].sort((a, b) => a - b);

            for (let i = 0; i <= sorted.length - selectedNoOfRooms; i++) {
                const slice = sorted.slice(i, i + selectedNoOfRooms);
                if (isConsecutive(slice)) {
                    bestCombo = slice;
                    break;
                }
            }
            if (bestCombo.length) break;
        }

        if (!bestCombo.length) {
            // 2. Greedy floor merge
            // Sort by floor asc
            const sortedFloors = Object.keys(roomsByFloor)
                .map(Number)
                .sort((a, b) => a - b);

            for (let i = 0; i < sortedFloors.length; i++) {
                const collected: number[] = [];
                for (let j = i; j < sortedFloors.length && collected.length < selectedNoOfRooms; j++) {
                    const floorRooms = roomsByFloor[sortedFloors[j]].sort((a, b) => a - b);
                    collected.push(...floorRooms.slice(0, selectedNoOfRooms - collected.length));
                }

                if (collected.length >= selectedNoOfRooms) {
                    bestCombo = collected.slice(0, selectedNoOfRooms);
                    break;
                }
            }
        }

        const newBookings: Booking[] = bestCombo.map((room) => ({
            room,
            type: 'manual',
        }));

        setBookedRooms([...bookedRooms, ...newBookings]);
    };

    const isConsecutive = (rooms: number[]): boolean => {
        const indices = rooms.map(getRoomIndexOnFloor).sort((a, b) => a - b);
        for (let i = 1; i < indices.length; i++) {
            if (indices[i] !== indices[i - 1] + 1) return false;
        }
        return true;
    };

    const randomRooms = () => {
        const alreadyBooked = bookedRooms.map((b) => b.room);
        const available = flatRooms.filter((r) => !alreadyBooked.includes(r));

        if (available.length === 0) return;

        const min = 5;
        const max = 30;
        const randomCount = Math.floor(Math.random() * (max - min + 1)) + min;

        const count = Math.min(randomCount, available.length);
        const shuffled = [...available].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, count);
        const newBookings: Booking[] = selected.map((room) => ({ room, type: 'random' }));

        setBookedRooms([...bookedRooms, ...newBookings]);
    };


    const resetRooms = () => {
        setBookedRooms([]);
    };

    const getRoomClass = (roomNumber: number) => {
        const booking = bookedRooms.find((b) => b.room === roomNumber);
        if (booking?.type === 'manual') return 'room-box booked';
        if (booking?.type === 'random') return 'room-box random-booked';
        return 'room-box';
    };

    return (
        <div className="room-booking">
            <div className="controls">
                <input
                    type="number"
                    max={5}
                    value={selectedNoOfRooms}
                    onChange={onInputRoomsChange}
                />
                <button onClick={bookRooms}>Book</button>
                <button onClick={resetRooms}>Reset</button>
                <button onClick={randomRooms}>Random</button>
            </div>
            {selectRoomsError && (
                <div className="controls error">
                    {selectRoomsError}
                </div>
            )}
            <div className="room-container">
                <div className="left-panel" />
                <div className="room-grid">
                    {roomsData.map((row, rowIndex) => (
                        <div key={rowIndex} className="room-row">
                            {row.map((roomNumber) => (
                                <div key={roomNumber} className={getRoomClass(roomNumber)}>
                                    {roomNumber}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RoomBooking;
