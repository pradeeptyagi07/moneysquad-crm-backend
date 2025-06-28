"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const organizations = [
    { name: "Apollo Hospitals", type: "Hospital" },
    { name: "Manipal Hospitals", type: "Hospital" },
    { name: "Care Hospitals", type: "Hospital" },
    { name: "Sunshine Hospitals", type: "Physio" },
    { name: "Vasan Eye Care", type: "Physio" },
];
const branchTypes = [
    "Hospital", "Dental", "Eye Clicnic", "Physio", "Diagnostics", "Pharmacy", "Doctors"
];
const statesAndCities = [
    { state: "Karnataka", cities: ["Bengaluru", "Mysuru", "Hubli", "Mangalore"] },
    { state: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur"] },
    { state: "Delhi", cities: ["New Delhi"] },
    { state: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai"] },
    { state: "Telangana", cities: ["Hyderabad", "Warangal"] },
    { state: "West Bengal", cities: ["Kolkata", "Howrah"] },
];
async function main() {
    console.log("🌱 Seeding organizations and branches...");
    for (const org of organizations) {
        const organization = await prisma.organization.create({
            data: {
                name: org.name,
                type: org.type,
                logo: null,
                status: true
            }
        });
        console.log(`✅ Inserted organization: ${organization.name} (${org.type})`);
        let branches = [];
        for (let i = 0; i < 6; i++) {
            const stateCity = statesAndCities[i % statesAndCities.length];
            const city = stateCity.cities[i % stateCity.cities.length];
            const branchType = branchTypes[i % branchTypes.length];
            branches.push({
                organizationId: organization.id,
                name: `${organization.name} - ${branchType}`,
                type: branchType,
                address: `Sector ${i + 1}, City Center, ${organization.name} Branch`,
                contactNumber: `98${Math.floor(10000000 + Math.random() * 89999999)}`,
                mapUrl: "https://www.google.com/maps/search/?api=1&query=hospital",
                photo: null,
                offer: "Special discount for first-time patients",
                state: stateCity.state,
                city: city,
                status: true
            });
        }
        await prisma.branch.createMany({ data: branches });
        console.log(`🛠 Inserted 40 branches for ${organization.name}`);
    }
    console.log("✅ Seeding completed!");
}
main()
    .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
// const statesWithCities = [
//   { name: "Andhra Pradesh", cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"] },
//   { name: "Arunachal Pradesh", cities: ["Itanagar", "Tawang", "Ziro"] },
//   { name: "Assam", cities: ["Guwahati", "Dibrugarh", "Silchar"] },
//   { name: "Bihar", cities: ["Patna", "Gaya", "Bhagalpur"] },
//   { name: "Chhattisgarh", cities: ["Raipur", "Bilaspur", "Durg"] },
//   { name: "Goa", cities: ["Panaji", "Margao"] },
//   { name: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"] },
//   { name: "Haryana", cities: ["Chandigarh", "Faridabad", "Gurgaon"] },
//   { name: "Himachal Pradesh", cities: ["Shimla", "Manali", "Dharamshala"] },
//   { name: "Jharkhand", cities: ["Ranchi", "Jamshedpur", "Dhanbad"] },
//   { name: "Karnataka", cities: ["Bengaluru", "Mysuru", "Hubli", "Mangalore"] },
//   { name: "Kerala", cities: ["Thiruvananthapuram", "Kochi", "Kozhikode"] },
//   { name: "Madhya Pradesh", cities: ["Bhopal", "Indore", "Gwalior"] },
//   { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Nashik"] },
//   { name: "Manipur", cities: ["Imphal", "Thoubal"] },
//   { name: "Meghalaya", cities: ["Shillong", "Tura"] },
//   { name: "Mizoram", cities: ["Aizawl", "Lunglei"] },
//   { name: "Nagaland", cities: ["Kohima", "Dimapur"] },
//   { name: "Odisha", cities: ["Bhubaneswar", "Cuttack", "Rourkela"] },
//   { name: "Punjab", cities: ["Amritsar", "Ludhiana", "Jalandhar"] },
//   { name: "Rajasthan", cities: ["Jaipur", "Udaipur", "Jodhpur"] },
//   { name: "Sikkim", cities: ["Gangtok", "Namchi"] },
//   { name: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai"] },
//   { name: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad"] },
//   { name: "Tripura", cities: ["Agartala", "Udaipur"] },
//   { name: "Uttar Pradesh", cities: ["Lucknow", "Varanasi", "Kanpur", "Agra"] },
//   { name: "Uttarakhand", cities: ["Dehradun", "Haridwar", "Rishikesh"] },
//   { name: "West Bengal", cities: ["Kolkata", "Howrah", "Durgapur"] },
//   { name: "Andaman and Nicobar Islands", cities: ["Port Blair"] },
//   { name: "Chandigarh", cities: ["Chandigarh"] },
//   { name: "Dadra and Nagar Haveli and Daman and Diu", cities: ["Silvassa", "Daman"] },
//   { name: "Lakshadweep", cities: ["Kavaratti"] },
//   { name: "Delhi", cities: ["New Delhi"] },
//   { name: "Puducherry", cities: ["Puducherry"] },
// ];
// async function main() {
//   console.log("Seeding states and cities...");
//   for (const state of statesWithCities) {
//     const createdState = await prisma.state.upsert({
//       where: { name: state.name },
//       update: {},
//       create: { name: state.name },
//     });
//     for (const city of state.cities) {
//       await prisma.city.upsert({
//         where: { name_stateId: { name: city, stateId: createdState.id } },
//         update: {},
//         create: { name: city, stateId: createdState.id },
//       });
//     }
//   }
//   console.log("Seeding completed!");
// }
// main()
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
