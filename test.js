const mongoose = require("mongoose");
const Specialization = require("./models/Category");

const config = require("./config/config");

let specialization = [
    "Cognitive Behaviour–Based Therapy",
    "Mindfulness & Acceptance-Based Practices",
    "Solution-Focused Therapy",
    "Goal-Oriented Approach",
    "Emotional Regulation Therapy",
    "Stress Management Techniques",
    "Relationship & Interpersonal Therapy",
    "Family Counseling",
    "Couple Therapy",
    "Grief, Loss & Life Transitions Support",
    "Career Consultation",
    "Positive Psychology–Based Well-Being Therapy",
    "Behaviour Change & Habit Development",
    "Behavioural Therapy",
    "NLP Coach",
    "Psycho-Educational Awareness Therapy",
    "Relaxation, Visualization & Hypnosis-Based Practices",
    "Trauma-Informed Emotional Support",
    "Sexual Therapist",
    "Intimacy Coach",
    "Child and Teenage Counseling",
    "Counseling Psychologist",
    "Clinical Psychologist",
    "Child & Adolescent Psychologist",
    "Trauma Therapist",
    "Addiction Counselor",
    "DBT Therapist",
    "Mindfulness Coach",
    "Life Coach",
    "Wellness Coach",
    "LGBTQ+ Affirmative Counselor"
]

const bulkSpecialization = async () => {
    try {
        await mongoose.connect(config.mongodb.dbConnectionString);
        specialization.reverse();
        for (let i = 0; i < specialization.length; i++) {
            // wait for 1 sec 
            await new Promise(resolve => setTimeout(resolve, 1000));
            await Specialization.create({
                title: specialization[i]
            })
        }
        console.log("Type inserted successfully:");
        await mongoose.connection.close();
    } catch (error) {
        console.log(error)
        await mongoose.connection.close();
    }
}
bulkSpecialization();