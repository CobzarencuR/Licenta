import React, { createContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import SQLite from 'react-native-sqlite-storage'

type WorkoutContextType = {
    trainingDays: number | null
    reloadTrainingDays: () => void
}

export const WorkoutContext = createContext<WorkoutContextType>({
    trainingDays: null,
    reloadTrainingDays: () => { },
})

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
    const [trainingDays, setTrainingDays] = useState<number | null>(null)

    const db = SQLite.openDatabase(
        { name: 'fitnessApp.db', location: 'default' },
        () => console.log('WorkoutContext DB opened'),
        e => console.error('WorkoutContext DB error', e),
    )

    const loadTrainingDays = async () => {
        const storedUsername = await AsyncStorage.getItem('loggedInUsername');
        if (!storedUsername) {
            setTrainingDays(null)
            return
        }

        db.transaction(tx => {
            tx.executeSql(
                'SELECT trainingDays FROM users WHERE username = ?;',
                [storedUsername],
                (_, { rows }) => {
                    if (rows.length > 0) {
                        setTrainingDays(rows.item(0).trainingDays)
                    } else {
                        setTrainingDays(null)
                    }
                },
                (_, err) => {
                    console.error('WorkoutContext loadTrainingDays failed', err)
                    return false
                }
            )
        })
    }

    useEffect(() => {
        loadTrainingDays()
    }, [])

    return (
        <WorkoutContext.Provider
            value={{ trainingDays, reloadTrainingDays: loadTrainingDays }}
        >
            {children}
        </WorkoutContext.Provider>
    )
}
