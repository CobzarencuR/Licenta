import React, { createContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import SQLite from 'react-native-sqlite-storage'

type WorkoutContextType = {
    height: number | null
    weight: number | null
    sex: 'M' | 'F' | null
    age: number | null
    objective: 'lose' | 'maintain' | 'gain' | null
    trainingDays: number | null
    experience: 'beginner' | 'intermediate' | 'advanced' | null
    reload: () => void
}

export const WorkoutContext = createContext<WorkoutContextType>({
    height: null,
    weight: null,
    sex: null,
    age: null,
    objective: null,
    trainingDays: null,
    experience: null,
    reload: () => { },
})

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
    const [height, setHeight] = useState<number | null>(null)
    const [weight, setWeight] = useState<number | null>(null)
    const [sex, setSex] = useState<'M' | 'F' | null>(null)
    const [age, setAge] = useState<number | null>(null)
    const [objective, setObjective] = useState<'lose' | 'maintain' | 'gain' | null>(null)
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
            setHeight(null)
            setWeight(null)
            setSex(null)
            setAge(null)
            setObjective(null)
            setTrainingDays(null)
            setExperience(null)
            return
        }
        db.transaction(tx => {
            tx.executeSql(
                `SELECT height, weight, sex, age, objective, trainingDays, experience 
           FROM users 
          WHERE username = ?;`,
                [username],
                (_, { rows }) => {
                    if (rows.length > 0) {
                        const r = rows.item(0)
                        setHeight(r.height)
                        setWeight(r.weight)
                        setSex(r.sex)
                        setAge(r.age)
                        setObjective(r.objective)
                        setTrainingDays(r.trainingDays)
                        setExperience(r.experience)
                    } else {
                        setHeight(null)
                        setWeight(null)
                        setSex(null)
                        setAge(null)
                        setObjective(null)
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
                height,
                weight,
                sex,
                age,
                objective,
                trainingDays,
                experience,
                reload: load,
            }}
        >
            {children}
        </WorkoutContext.Provider>
    )
}
