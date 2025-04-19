import React, { useCallback, useContext, useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { WorkoutContext } from '../context/WorkoutContext'

type SplitDay = { name: string; muscles: string[] }
type Exercise = {
    exerciseid: number
    name: string
    difficulty: string
    equipment: string
    primary_muscle_group: string
    secondary_muscle_group: string | null
    tertiary_muscle_group: string | null
    sets?: number
    reps?: number
    weight?: string
}

// --- 1) Two distinct template sets ---
const beginnerTemplates: Record<string, SplitDay> = {
    fullbody: { name: 'Full Body', muscles: ['quads', 'quads', 'chest', 'middleback', 'upperchest', 'lats', 'lateralshoulders', 'longtriceps', 'biceps'] },
    push: { name: 'Push', muscles: ['chest', 'chest', 'upperchest', 'lateralshoulders', 'longtriceps', 'lateraltriceps'] },
    pull: { name: 'Pull', muscles: ['middleback', 'lats', 'middleback', 'rearshoulders', 'longbiceps', 'shortbiceps'] },
    legs: { name: 'Legs', muscles: ['quads', 'quads', 'hamstrings', 'calves', 'abs'] },
    upper: { name: 'Upper', muscles: ['chest', 'middleback', 'upperchest', 'lats', 'lateralshoulders', 'longtriceps', 'biceps'] },
    lower: { name: 'Lower', muscles: ['quads', 'quads', 'hamstrings', 'calves', 'abs'] },
}

const intermediateTemplates: Record<string, SplitDay> = {
    fullbody: { name: 'Full Body', muscles: ['quads', 'quads', 'chest', 'middleback', 'upperchest', 'lats', 'lateralshoulders', 'longtriceps', 'biceps', 'brachialis'] },
    push: { name: 'Push', muscles: ['chest', 'upperchest', 'chest', 'upperchest', 'lateralshoulders', 'lateralshoulders', 'longtriceps', 'lateraltriceps', 'longtriceps'] },
    pull: { name: 'Pull', muscles: ['middleback', 'lats', 'middleback', 'lats', 'rearshoulders', 'longbiceps', 'shortbiceps', 'brachialis'] },
    legs: { name: 'Legs', muscles: ['quads', 'quads', 'hamstrings', 'hamstrings', 'calves', 'abs', 'abs'] },
    upper: { name: 'Upper', muscles: ['chest', 'middleback', 'upperchest', 'lats', 'lateralshoulders', 'lateralshoulders', 'longtriceps', 'biceps', 'lateraltriceps', 'brachialis'] },
    lower: { name: 'Lower', muscles: ['quads', 'quads', 'hamstrings', 'hamstrings', 'calves', 'abs', 'abs'] },
}

// 2) Same day‐to‐template mapping:
const splitKeysByDays: Record<number, (keyof typeof beginnerTemplates)[]> = {
    2: ['fullbody', 'fullbody'],
    3: ['push', 'pull', 'legs'],
    4: ['upper', 'lower', 'upper', 'lower'],
    5: ['push', 'pull', 'legs', 'upper', 'lower'],
    6: ['push', 'pull', 'legs', 'push', 'pull', 'legs'],
    7: ['push', 'pull', 'legs', 'upper', 'lower', 'push', 'pull'],
}

// 3) Sets & reps schemes:
const isCompound = new Set([
    'chest', 'upperchest', 'lowerchest', 'lats', 'middleback', 'quads'
])
const beginnerParams = { sets: 3, repC: 10, repI: 12 }
const intermediateParams = { sets: 4, repC: 8, repI: 10 }

export default function WorkoutScreen() {
    const { trainingDays, experience, reload } = useContext(WorkoutContext)
    const [exByDay, setExByDay] = useState<Record<number, Exercise[]>>({})
    const [loading, setLoading] = useState(true)

    useFocusEffect(useCallback(() => {
        reload()
    }, [reload]))

    useEffect(() => {
        if (trainingDays == null || experience == null) return

        // pick which templates to use:
        const tplSet = experience === 'intermediate'
            ? intermediateTemplates
            : beginnerTemplates

        const dayKeys = splitKeysByDays[trainingDays] || []
        const split: SplitDay[] = dayKeys.map(k => tplSet[k])

        if (!split.length) { setLoading(false); return }

        setLoading(true)
            ; (async () => {
                // aggregate needed muscles
                const musclesNeeded = Array.from(
                    new Set(split.flatMap(d => d.muscles))
                )
                const qs = encodeURIComponent(musclesNeeded.join(','))
                const res = await fetch(`http://10.0.2.2:3000/getExercisesByPrimaryMuscle?muscles=${qs}`)
                let all: Exercise[] = res.ok ? await res.json() : []
                // filter by allowed difficulties
                const allowed = experience === 'advanced'
                    ? ['beginner', 'intermediate', 'advanced']
                    : experience === 'intermediate'
                        ? ['beginner', 'intermediate']
                        : ['beginner']
                all = all.filter(e => allowed.includes(e.difficulty))

                // bucket by primary muscle
                const buckets: Record<string, Exercise[]> = {}
                musclesNeeded.forEach(m => {
                    buckets[m] = all.filter(e => e.primary_muscle_group === m).slice()
                })

                // picks per day
                const params = experience === 'intermediate'
                    ? intermediateParams
                    : beginnerParams

                const dayMap: Record<number, Exercise[]> = {}
                split.forEach((day, idx) => {
                    // clone each bucket
                    const local = Object.fromEntries(
                        Object.entries(buckets).map(([m, arr]) => [m, [...arr]])
                    ) as typeof buckets

                    const picks: Exercise[] = []
                    day.muscles.forEach(muscle => {
                        const pool = local[muscle] || []
                        if (pool.length) {
                            const ex = pool.shift()!
                            ex.sets = params.sets
                            ex.reps = isCompound.has(muscle)
                                ? params.repC
                                : params.repI
                            ex.weight = 'TBD'
                            picks.push(ex)
                        }
                    })
                    dayMap[idx] = picks
                })

                setExByDay(dayMap)
            })()
                .catch(console.error)
                .finally(() => setLoading(false))

    }, [trainingDays, experience])

    if (trainingDays == null || loading) {
        return <View style={styles.center}>
            <ActivityIndicator size="large" color="#007AFF" />
        </View>
    }

    const dayKeys = splitKeysByDays[trainingDays] || []
    const split: SplitDay[] = dayKeys.map(k =>
        (experience === 'intermediate' ? intermediateTemplates : beginnerTemplates)[k]
    )

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
                        <FlatList
                            data={exByDay[index] || []}
                            keyExtractor={ex => ex.exerciseid.toString()}
                            renderItem={({ item: ex }) => (
                                <View style={styles.exItem}>
                                    <Text style={styles.exName}>{ex.name}</Text>
                                    <Text style={styles.exDetails}>
                                        {ex.sets}×{ex.reps} @ {ex.weight}
                                    </Text>
                                </View>
                            )}
                        />
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
    dayLabel: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    exItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    exName: { fontSize: 16, flex: 1 },
    exDetails: { fontSize: 14, color: '#888', textAlign: 'right' },
})
