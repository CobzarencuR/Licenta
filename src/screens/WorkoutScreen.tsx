import React, { useCallback, useContext, useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { WorkoutContext } from '../context/WorkoutContext'
import { UserContext } from '../context/UserContext'

type SplitDay = { name: string; muscles: string[] }
type Exercise = {
    exerciseid: number
    name: string
    difficulty: string
    equipment: string
    primary_muscle_group: string
    secondary_muscle_group: string | null
    tertiary_muscle_group: string | null
}

const splitTemplates: Record<string, SplitDay> = {
    fullbody: {
        name: 'Full Body',
        muscles: [
            'chest', 'upperchest', 'lowerchest',
            'middleback', 'lats',
            'frontalshoulders', 'lateralshoulders', 'rearshoulders',
            'brachialis', 'longbiceps', 'shortbiceps', 'biceps',
            'lateraltriceps', 'longtriceps',
            'quads', 'hamstrings', 'glutes', 'calves', 'abs',
        ],
    },
    push: {
        name: 'Push',
        muscles: [
            'chest', 'upperchest', 'lowerchest',
            'frontalshoulders', 'lateralshoulders',
            'lateraltriceps', 'longtriceps', 'triceps',
        ],
    },
    pull: {
        name: 'Pull',
        muscles: [
            'middleback', 'lats',
            'frontalshoulders', 'lateralshoulders', 'rearshoulders',
            'brachialis', 'longbiceps', 'shortbiceps', 'biceps',
        ],
    },
    legs: {
        name: 'Legs',
        muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'],
    },
    upper: {
        name: 'Upper',
        muscles: [
            'chest', 'upperchest', 'lowerchest',
            'middleback', 'lats',
            'frontalshoulders', 'lateralshoulders', 'rearshoulders',
            'brachialis', 'longbiceps', 'shortbiceps', 'biceps',
            'lateraltriceps', 'longtriceps', 'triceps',
        ],
    },
    lower: {
        name: 'Lower',
        muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'],
    },
}

// 2) Map days → template keys
const splitKeysByDays: Record<number, (keyof typeof splitTemplates)[]> = {
    2: ['fullbody', 'fullbody'],
    3: ['push', 'pull', 'legs'],
    4: ['upper', 'lower', 'upper', 'lower'],
    5: ['push', 'pull', 'legs', 'upper', 'lower'],
    6: ['push', 'pull', 'legs', 'push', 'pull', 'legs'],
    7: ['push', 'pull', 'legs', 'upper', 'lower', 'push', 'pull'],
}
const splitsByDays: Record<number, SplitDay[]> = Object.fromEntries(
    Object.entries(splitKeysByDays).map(([days, keys]) => [
        Number(days),
        keys.map(k => splitTemplates[k]),
    ])
) as any

export default function WorkoutScreen() {
    const { trainingDays, reloadTrainingDays } = useContext(WorkoutContext)
    const { user } = useContext(UserContext)
    const [exByDay, setExByDay] = useState<Record<number, Exercise[]>>({})
    const [loading, setLoading] = useState(true)

    useFocusEffect(
        useCallback(() => {
            reloadTrainingDays()
        }, [reloadTrainingDays])
    )

    useEffect(() => {
        if (trainingDays == null || !user) return
        const split = splitsByDays[trainingDays] || []
        if (!split.length) {
            setLoading(false)
            return
        }

        setLoading(true)
            ; (async () => {
                // 1) figure out every muscle we need
                const musclesNeeded = Array.from(
                    new Set(split.flatMap(d => d.muscles))
                )

                // 2) fetch & filter by difficulty
                const qs = encodeURIComponent(musclesNeeded.join(','))
                const res = await fetch(
                    `http://10.0.2.2:3000/getExercisesByPrimaryMuscle?muscles=${qs}`
                )
                let all: Exercise[] = res.ok ? await res.json() : []
                if (user.experience === 'beginner') {
                    all = all.filter(e => e.difficulty === 'beginner')
                } else if (user.experience === 'intermediate') {
                    all = all.filter(e =>
                        ['beginner', 'intermediate'].includes(e.difficulty)
                    )
                }

                // 3) build master buckets
                const masterBuckets: Record<string, Exercise[]> = {}
                musclesNeeded.forEach(m => {
                    masterBuckets[m] = all.filter(e => e.primary_muscle_group === m)
                })

                // 4) define your slot‑by‑slot pick order instead of counts:
                const scheme: Record<string, string[]> = {
                    'Full Body': [
                        'quads', 'quads', 'chest', 'middleback', 'upperchest', 'lats', 'lateralshoulders', 'longtriceps', 'biceps'
                    ],
                    Upper: [
                        'chest', 'middleback', 'upperchest', 'lats', 'lateralshoulders', 'longtriceps', 'biceps'
                    ],
                    Lower: [
                        'quads', 'quads', 'hamstrings', 'calves', 'abs'
                    ],
                    Push: [
                        'chest', 'upperchest', 'lateralshoulders', 'longtriceps', 'lateraltriceps'
                    ],
                    Pull: [
                        'middleback', 'lats', 'middleback', 'rearshoulders', 'longbiceps', 'shortbiceps'
                    ],
                    Legs: [
                        'quads', 'quads', 'hamstrings', 'calves', 'abs'
                    ],
                }

                // 5) build each day’s picks by walking that array
                const dayMap: Record<number, Exercise[]> = {}
                split.forEach((day, idx) => {
                    // clone each muscle bucket so we don't exhaust the master
                    const localBuckets: Record<string, Exercise[]> = {}
                    Object.entries(masterBuckets).forEach(([m, arr]) => {
                        localBuckets[m] = [...arr]
                    })

                    const picks: Exercise[] = []
                        ; (scheme[day.name] || []).forEach(muscle => {
                            const bucket = localBuckets[muscle] || []
                            if (bucket.length) {
                                picks.push(bucket.shift()!)
                            }
                        })

                    dayMap[idx] = picks
                })

                setExByDay(dayMap)
            })()
                .catch(console.error)
                .finally(() => setLoading(false))
    }, [trainingDays, user?.experience])

    if (trainingDays == null || loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        )
    }

    const split = splitsByDays[trainingDays] || []
    return (
        <View style={styles.container}>
            <Text style={styles.header}>
                {split.length
                    ? `Your ${trainingDays}-Day Split`
                    : 'No split configured — set Training Days in Profile'}
            </Text>

            <FlatList
                data={split}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item, index }) => (
                    <View style={styles.dayBox}>
                        <Text style={styles.dayLabel}>
                            Day {index + 1}: {item.name}
                        </Text>
                        <Text style={styles.muscles}>
                            Targets: {item.muscles.join(', ')}
                        </Text>

                        {exByDay[index]?.length ? (
                            <FlatList
                                data={exByDay[index]}
                                keyExtractor={ex => ex.exerciseid.toString()}
                                renderItem={({ item: ex }) => (
                                    <View style={styles.exItem}>
                                        <Text style={styles.exName}>{ex.name}</Text>
                                        <Text style={styles.exDetails}>
                                            ({ex.primary_muscle_group})
                                        </Text>
                                    </View>
                                )}
                            />
                        ) : (
                            <Text style={styles.emptyText}>
                                No exercises found for these targets.
                            </Text>
                        )}
                    </View>
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    dayBox: { marginBottom: 20, padding: 12, backgroundColor: '#f0f4f7', borderRadius: 8 },
    dayLabel: { fontSize: 18, fontWeight: '600' },
    muscles: { fontSize: 14, color: '#555', marginBottom: 8 },
    exItem: { flexDirection: 'row', marginBottom: 4 },
    exName: { fontSize: 16, flex: 1 },
    exDetails: { fontSize: 14, color: '#888', textAlign: 'right' },
    emptyText: { fontStyle: 'italic', color: '#888' },
})
