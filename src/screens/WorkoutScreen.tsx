import React, { useContext, useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { WorkoutContext } from '../context/WorkoutContext'

type SplitDay = { name: string; muscles: string[] }
type Exercise = {
    exerciseid: number
    name: string
    difficulty: string
    primary_muscle_group: string
    secondary_muscle_group: string | null
    tertiary_muscle_group: string | null
}

const splitTemplates: Record<string, SplitDay> = {
    fullbody: {
        name: 'Full Body',
        muscles: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'calves', 'abs'],
    },
    push: {
        name: 'Push',
        muscles: ['chest', 'triceps', 'shoulders'],
    },
    pull: {
        name: 'Pull',
        muscles: ['back', 'biceps'],
    },
    legs: {
        name: 'Legs',
        muscles: ['quads', 'hamstrings', 'glutes', 'calves'],
    },
    upper: {
        name: 'Upper',
        muscles: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
    },
    lower: {
        name: 'Lower',
        muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'abs'],
    },
}

const splitKeysByDays: Record<number, (keyof typeof splitTemplates)[]> = {
    2: ['fullbody', 'fullbody'],
    3: ['push', 'pull', 'legs'],
    4: ['upper', 'lower', 'upper', 'lower'],
    5: ['push', 'pull', 'legs', 'upper', 'lower'],
    6: ['push', 'pull', 'legs', 'push', 'pull', 'legs'],
}

const splitsByDays: Record<number, SplitDay[]> = Object.fromEntries(
    Object.entries(splitKeysByDays).map(([days, keys]) => [
        Number(days),
        keys.map(k => splitTemplates[k]),
    ])
) as Record<number, SplitDay[]>


export default function WorkoutScreen() {
    const { trainingDays } = useContext(WorkoutContext)
    const [exByDay, setExByDay] = useState<Record<number, Exercise[]>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (trainingDays == null) return

        const split = splitsByDays[trainingDays] || []
        if (!split.length) {
            setLoading(false)
            return
        }

        setLoading(true)
        Promise.all(
            split.map(day =>
                fetch(
                    `http://10.0.2.2:3000/getExercisesByPrimaryMuscle?muscles=${encodeURIComponent(
                        day.muscles.join(','),
                    )}`,
                )
                    .then(r => {
                        if (!r.ok) {
                            console.error(`HTTP ${r.status} from getExercisesByPrimaryMuscle`, r);
                            return [];
                        }
                        return r.json() as Promise<Exercise[]>;
                    })
            )
        )
            .then(results => {
                const map: Record<number, Exercise[]> = {};
                results.forEach((arr, idx) => (map[idx] = arr));
                setExByDay(map);
            })
            .catch(err => {
                console.error('Error fetching exercises:', err);
            })
            .finally(() => setLoading(false));

    }, [trainingDays])

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
                                        <Text style={styles.exDetails}>({ex.difficulty})</Text>
                                    </View>
                                )}
                            />
                        ) : (
                            <Text style={styles.emptyText}>
                                No exercises found for these muscles.
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
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    dayBox: {
        marginBottom: 20,
        padding: 12,
        backgroundColor: '#f0f4f7',
        borderRadius: 8,
    },
    dayLabel: { fontSize: 18, fontWeight: '600' },
    muscles: { fontSize: 14, color: '#555', marginBottom: 8 },
    exItem: { flexDirection: 'row', marginBottom: 4 },
    exName: { fontSize: 16 },
    exDetails: { fontSize: 14, color: '#888', marginLeft: 6 },
    emptyText: { fontStyle: 'italic', color: '#888' },
})
