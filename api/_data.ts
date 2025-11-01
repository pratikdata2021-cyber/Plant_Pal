
import { Plant, JournalEntry, Article } from "../components/Dashboard";

// Using a let binding so the arrays can be mutated by the API functions
export let mockPlants: Plant[] = [
    {
        id: 1,
        name: 'Monstera Deliciosa',
        scientificName: 'Monstera deliciosa',
        image: 'https://picsum.photos/id/106/500/600',
        light: 'Medium',
        health: 'healthy',
        location: 'Living Room',
        wateringFrequency: 7,
        lastWatered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        fertilizingFrequency: 30,
        lastFertilized: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        groomingFrequency: 60,
        lastGroomed: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        sunlight: 'Bright, indirect light',
        humidity: 'Medium Humidity',
        notes: 'Loves to be misted occasionally. Check for new leaves unfurling!',
        fertilizerDetails: 'Use a balanced liquid fertilizer (20-20-20) every 4 weeks during the growing season.'
    },
    {
        id: 2,
        name: 'Snake Plant',
        scientificName: 'Dracaena trifasciata',
        image: 'https://picsum.photos/id/152/500/600',
        light: 'Low',
        health: 'healthy',
        location: 'Bedroom',
        wateringFrequency: 21,
        lastWatered: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        fertilizingFrequency: 90,
        lastFertilized: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
        groomingFrequency: 120,
        lastGroomed: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
        sunlight: 'Low to bright, indirect light',
        humidity: 'Low Humidity',
        notes: 'Very resilient. Almost impossible to kill. Water sparingly.',
    },
    {
        id: 3,
        name: 'Fiddle Leaf Fig',
        scientificName: 'Ficus lyrata',
        image: 'https://picsum.photos/id/206/500/600',
        light: 'Bright',
        health: 'attention',
        location: 'Office',
        wateringFrequency: 10,
        lastWatered: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        fertilizingFrequency: 30,
        lastFertilized: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        groomingFrequency: 45,
        lastGroomed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        sunlight: 'Bright, consistent light',
        humidity: 'High Humidity',
        notes: 'A bit fussy. Avoid moving it and keep away from drafts. Leaves have some brown spots.',
    }
];

export let mockJournalEntries: JournalEntry[] = [
    {
        id: 1,
        title: "Repotted the Monstera!",
        content: "Finally moved the Monstera to a larger pot. The roots were looking really healthy. Used a mix of potting soil, perlite, and orchid bark. Watered it thoroughly after repotting.",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 2,
        title: "First Flower on the Orchid",
        content: "Woke up this morning to see the first bloom on the Phalaenopsis orchid. It's a beautiful white and purple flower. So exciting!",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        file: {
            name: "orchid_bloom.jpg",
            type: "image",
            url: "https://picsum.photos/id/1027/400/300"
        }
    }
];

export let mockArticles: Article[] = [
    {
        id: 1,
        title: "The Ultimate Guide to Watering Your Houseplants",
        category: "Watering",
        type: "Guide",
        description: "Learn the do's and don'ts of watering to keep your plants perfectly hydrated.",
        image: "https://picsum.photos/id/1015/400/300",
        link: "#",
        content: "**Watering is crucial, but overwatering is the #1 killer of houseplants.**\n\nMost people think more water is better, but plant roots need oxygen too. When soil is constantly soggy, roots can't breathe and they begin to rot.\n\nThe best rule of thumb is to check the soil. Stick your finger about an inch or two into the soil. If it feels dry, it's time to water. If it's still moist, wait a few more days."
    },
    {
        id: 2,
        title: "Decoding Sunlight: How Much Light Does Your Plant Need?",
        category: "Sunlight",
        type: "Article",
        description: "From low light to full sun, find the perfect spot for every plant in your home.",
        image: "https://picsum.photos/id/103/400/300",
        link: "#",
        content: "**Sunlight is food for your plants.**\n\nIt's the energy source for photosynthesis. But not all light is created equal.\n\n*   **Bright, direct light:** At least 4-6 hours of direct sun. Great for cacti and succulents.\n*   **Bright, indirect light:** A bright spot where the sun's rays don't directly hit the leaves. Most tropical houseplants love this.\n*   **Medium light:** A spot that gets indirect light for part of the day, but is further from a window.\n*   **Low light:** A room with no direct sun, like a north-facing window. Best for plants like the Snake Plant or ZZ Plant."
    },
    {
        id: 3,
        title: "Beginner's Guide to Repotting",
        category: "Repotting",
        type: "Guide",
        description: "Give your plants room to grow with this simple, step-by-step repotting guide.",
        image: "https://picsum.photos/id/1068/400/300",
        link: "#",
        content: "**Don't be afraid to repot!**\n\nIt seems intimidating, but it's essential for a plant's long-term health. \n\n**When to Repot:**\n\n*   Roots are growing out of the drainage holes.\n*   The plant is top-heavy and falls over easily.\n*   Water runs straight through the pot without being absorbed.\n\nChoose a pot that is only 1-2 inches larger in diameter than the current one."
    }
];
