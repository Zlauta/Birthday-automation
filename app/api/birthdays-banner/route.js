import { birthdayManager } from '@/service/birthdayManager.service.js';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const processed = await birthdayManager.processDailyBirthdays();

        if (processed.length === 0) {
            return NextResponse.json({ message: "No hay cumpleañeros hoy." }, { status: 200 });
        }

        return NextResponse.json({ 
            status: "success", 
            data: processed 
        }, { status: 201 });

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}