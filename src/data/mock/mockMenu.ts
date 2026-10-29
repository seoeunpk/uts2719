/**
 * MOCK DATA FOR UI PREVIEW ONLY
 *
 * Dish names, stalls and prices below are made up so the frontend can be
 * designed before the real dataset is connected. They are NOT real NUS menu
 * information. Do not ship this file as a data source; see `src/data/index.ts`.
 *
 * Canteen coordinates are approximate and should be checked against the
 * real dataset before launch.
 */
import type { Canteen, MenuItem } from '../../types/menu'

export const mockCanteens: Canteen[] = [
  { id: 'the-deck', coordinates: { lat: 1.2944, lng: 103.7725 }, name: 'The Deck', location: 'Arts & Social Sciences', openingHours: '7:30am – 8pm' },
  { id: 'frontier', coordinates: { lat: 1.2963, lng: 103.7804 }, name: 'Frontier', location: 'Faculty of Science', openingHours: '7:30am – 8pm' },
  { id: 'techno-edge', coordinates: { lat: 1.298, lng: 103.7717 }, name: 'Techno Edge', location: 'Engineering', openingHours: '7am – 8pm' },
  { id: 'pgp', coordinates: { lat: 1.2912, lng: 103.7808 }, name: 'PGP Canteen', location: "Prince George's Park", openingHours: '7am – 9pm' },
  { id: 'fine-food', coordinates: { lat: 1.304, lng: 103.7737 }, name: 'Fine Food', location: 'University Town', openingHours: '8am – 9pm' },
  { id: 'the-terrace', coordinates: { lat: 1.295, lng: 103.7742 }, name: 'The Terrace', location: 'School of Computing', openingHours: '7:30am – 7pm' },
]

export const mockMenuItems: MenuItem[] = [
  { id: 'm1', name: 'Roasted Chicken Rice', price: 4.0, stallName: 'Mock Chicken Rice Stall', canteenId: 'the-deck', cuisine: 'Chinese', dietary: [] },
  { id: 'm2', name: 'Nasi Lemak Set', price: 4.5, stallName: 'Mock Malay Stall', canteenId: 'the-deck', cuisine: 'Malay', dietary: ['halal'] },
  { id: 'm3', name: 'Mala Xiang Guo', price: 7.8, stallName: 'Mock Mala Stall', canteenId: 'frontier', cuisine: 'Chinese', dietary: [] },
  { id: 'm4', name: 'Sliced Fish Soup', price: 5.5, stallName: 'Mock Fish Soup Stall', canteenId: 'frontier', cuisine: 'Chinese', dietary: ['no-pork-no-lard'] },
  { id: 'm5', name: 'Prata with Curry', price: 3.2, stallName: 'Mock Indian Stall', canteenId: 'techno-edge', cuisine: 'Indian', dietary: ['halal', 'vegetarian'] },
  { id: 'm6', name: 'Chicken Chop with Fries', price: 6.5, stallName: 'Mock Western Stall', canteenId: 'techno-edge', cuisine: 'Western', dietary: ['halal'] },
  { id: 'm7', name: 'Aglio Olio', price: 5.8, stallName: 'Mock Western Stall', canteenId: 'techno-edge', cuisine: 'Western', dietary: ['vegetarian'] },
  { id: 'm8', name: 'Chicken Katsu Don', price: 6.9, stallName: 'Mock Japanese Stall', canteenId: 'pgp', cuisine: 'Japanese', dietary: [] },
  { id: 'm9', name: 'Beef Bibimbap', price: 8.5, stallName: 'Mock Korean Stall', canteenId: 'fine-food', cuisine: 'Korean', dietary: [] },
  { id: 'm10', name: 'Tofu Kimchi Stew', price: 7.0, stallName: 'Mock Korean Stall', canteenId: 'fine-food', cuisine: 'Korean', dietary: ['vegetarian'] },
  { id: 'm11', name: 'Pad Thai', price: 6.0, stallName: 'Mock Thai Stall', canteenId: 'fine-food', cuisine: 'Thai', dietary: ['no-pork-no-lard'] },
  { id: 'm12', name: 'Mixed Veg Bee Hoon', price: 3.5, stallName: 'Mock Vegetarian Stall', canteenId: 'pgp', cuisine: 'Vegetarian', dietary: ['vegetarian', 'vegan'] },
  { id: 'm13', name: 'Mee Rebus', price: 3.8, stallName: 'Mock Malay Stall', canteenId: 'the-terrace', cuisine: 'Malay', dietary: ['halal'] },
  { id: 'm14', name: 'Brown Sugar Milk Tea', price: 3.9, stallName: 'Mock Drinks Stall', canteenId: 'the-terrace', cuisine: 'Drinks', dietary: ['vegetarian'] },
  { id: 'm15', name: 'Grilled Salmon Bowl', price: 9.5, stallName: 'Mock Japanese Stall', canteenId: 'fine-food', cuisine: 'Japanese', dietary: ['no-pork-no-lard'] },
  { id: 'm16', name: 'Ice Kacang', price: 2.8, stallName: 'Mock Dessert Stall', canteenId: 'frontier', cuisine: 'Desserts', dietary: ['vegetarian', 'vegan'] },
]
