import React, { createContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import SQLite from 'react-native-sqlite-storage'

type WorkoutContextType = {
    trainingDays: number | null
    experience: 'beginner' | 'intermediate' | 'advanced' | null
    reload: () => void
}

export const WorkoutContext = createContext<WorkoutContextType>({
    trainingDays: null,
    experience: null,
    reload: () => { },
})

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
    const [trainingDays, setTrainingDays] = useState<number | null>(null)
    const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null)

    const db = SQLite.openDatabase(
        { name: 'fitnessApp.db', location: 'default' },
        () => console.log('WorkoutContext DB opened'),
        e => console.error('WorkoutContext DB error', e),
    )

    const load = async () => {
        const username = await AsyncStorage.getItem('loggedInUsername')
        if (!username) {
            setTrainingDays(null)
            setExperience(null)
            return
        }
        db.transaction(tx => {
            tx.executeSql(
                `SELECT trainingDays, experience 
           FROM users 
          WHERE username = ?;`,
                [username],
                (_, { rows }) => {
                    if (rows.length > 0) {
                        const r = rows.item(0)
                        setTrainingDays(r.trainingDays)
                        setExperience(r.experience)
                    } else {
                        setTrainingDays(null)
                        setExperience(null)
                    }
                },
                (_, err) => {
                    console.error('WorkoutContext load failed', err)
                    return false
                }
            )
        })
    }

    useEffect(() => {
        load()
    }, [])

    return (
        <WorkoutContext.Provider
            value={{
                trainingDays,
                experience,
                reload: load,
            }}
        >
            {children}
        </WorkoutContext.Provider>
    )
}
