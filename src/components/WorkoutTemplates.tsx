export interface ExercisePlanItem {
    name: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    equipment: string;
    primary_muscle_group: string;
    secondary_muscle_group: string | null;
    tertiary_muscle_group: string | null;
    sets: number;
    reps: number;
    weight: string;
}

export const PlanTemplates: Record<'lose' | 'maintain' | 'gain', Record<'M' | 'F', Record<number, ExercisePlanItem[][]>>
> = {
    lose: {
        M: {
            3: [
                // [
                //     { name: 'Jumping Jacks', sets: 3, reps: 30 },
                //     { name: 'Mountain Climbers', sets: 3, reps: 20 },
                //     { name: 'Burpees', sets: 3, reps: 12 },
                // ],
                // [
                //     { name: 'Squat Jumps', sets: 3, reps: 15 },
                //     { name: 'Push‑ups', sets: 3, reps: 12 },
                //     { name: 'Plank', sets: 3, reps: 45, weight: 'bodyweight' },
                // ],
                // [
                //     { name: 'Lunges', sets: 3, reps: 12 },
                //     { name: 'High Knees', sets: 3, reps: 30 },
                //     { name: 'Russian Twists', sets: 3, reps: 20 },
                // ],
            ],
            4: [
                /* 4‑day split… */
            ],
            // etc.
        },
        F: {
            3: [
                // [
                //     { name: 'Bodyweight Squats', sets: 3, reps: 15 },
                //     { name: 'Step‑ups', sets: 3, reps: 12 },
                //     { name: 'Plank', sets: 3, reps: 45, weight: 'bodyweight' },
                // ],
                // [
                //     { name: 'Glute Bridges', sets: 3, reps: 15 },
                //     { name: 'Reverse Lunges', sets: 3, reps: 12 },
                //     { name: 'Russian Twists', sets: 3, reps: 20 },
                // ],
                // [
                //     { name: 'Jumping Jacks', sets: 3, reps: 30 },
                //     { name: 'High Knees', sets: 3, reps: 30 },
                //     { name: 'Burpees', sets: 3, reps: 10 },
                // ],
            ],
            4: [ /* … */],
        },
    },

    maintain: {
        M: {
            3: [
                [
                    { name: 'Deadlifts', difficulty: 'beginner', equipment: 'bodyweight', primary_muscle_group: 'quads', secondary_muscle_group: 'hamstrings', tertiary_muscle_group: 'glutes', sets: 3, reps: 10, weight: 'TBD' },
                    { name: 'Squats', difficulty: 'beginner', equipment: 'bodyweight', primary_muscle_group: 'quads', secondary_muscle_group: 'hamstrings', tertiary_muscle_group: 'glutes', sets: 3, reps: 10, weight: 'TBD' },
                    { name: 'Pull-ups', difficulty: 'beginner', equipment: 'bodyweight', primary_muscle_group: 'lats', secondary_muscle_group: 'biceps', tertiary_muscle_group: null, sets: 3, reps: 10, weight: 'TBD' },
                ],
                [
                    { name: 'Push-ups', difficulty: 'beginner', equipment: 'bodyweight', primary_muscle_group: 'chest', secondary_muscle_group: 'triceps', tertiary_muscle_group: 'shoulders', sets: 3, reps: 10, weight: 'TBD' },
                    { name: 'Lateral Raises', difficulty: 'beginner', equipment: 'dumbbell', primary_muscle_group: 'lateralshoulders', secondary_muscle_group: null, tertiary_muscle_group: null, sets: 3, reps: 12, weight: 'TBD' },
                    { name: 'Shoulder Press', difficulty: 'beginner', equipment: 'dumbbell', primary_muscle_group: 'frontalshoulders', secondary_muscle_group: null, tertiary_muscle_group: null, sets: 3, reps: 12, weight: 'TBD' },
                ],
                [

                    { name: 'Leg Press', difficulty: 'beginner', equipment: 'machine', primary_muscle_group: 'quads', secondary_muscle_group: 'hamstrings', tertiary_muscle_group: 'glutes', sets: 3, reps: 10, weight: 'TBD' },
                    { name: 'Bicep Curls', difficulty: 'beginner', equipment: 'dumbbell', primary_muscle_group: 'biceps', secondary_muscle_group: null, tertiary_muscle_group: null, sets: 3, reps: 12, weight: 'TBD' },
                    { name: 'Hammer Curls', difficulty: 'beginner', equipment: 'dumbbell', primary_muscle_group: 'brachialis', secondary_muscle_group: null, tertiary_muscle_group: null, sets: 3, reps: 12, weight: 'TBD' },
                ],
            ],
            4: [ /* … */],
        },
        F: {
            3: [ /* … */],
            4: [ /* … */],
        },
    },

    gain: {
        M: {
            3: [
                // [
                //     { name: 'Barbell Deadlift', sets: 4, reps: 6, weight: 'TBD' },
                //     { name: 'Weighted Pull‑up', sets: 4, reps: 6, weight: 'TBD' },
                //     { name: 'Barbell Row', sets: 4, reps: 8, weight: 'TBD' },
                // ],
                // [
                //     { name: 'Barbell Squat', sets: 4, reps: 6, weight: 'TBD' },
                //     { name: 'Leg Press', sets: 4, reps: 10, weight: 'TBD' },
                //     { name: 'Romanian Deadlift', sets: 4, reps: 8, weight: 'TBD' },
                // ],
                // [
                //     { name: 'Bench Press', sets: 4, reps: 6, weight: 'TBD' },
                //     { name: 'Overhead Press', sets: 4, reps: 8, weight: 'TBD' },
                //     { name: 'Incline Dumbbell Press', sets: 4, reps: 10, weight: 'TBD' },
                // ],
            ],
            4: [ /* … */],
        },
        F: {
            3: [ /* … */],
            4: [ /* … */],
        },
    },
}