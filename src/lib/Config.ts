import { cities as defaultCities } from '../data/cities';
import { Assortment } from './Assortment';

export class Config {
	#cities: string[] | null;

	get cities(): Readonly<string[]> {
		return this.#cities ?? defaultCities;
	}

	set cities(cities: string[] | null) {
		this.#cities = cities;
	}

	#mainDeck: Assortment;

	get masterDeck(): Assortment {
		return this.#mainDeck;
	}

	constructor() {
		this.#cities = null;

		this.#mainDeck = {
			name: 'Master Deck',
			cards: [
				{
					name: 'Epidemic',
					type: 'Epidemic',
					image: '/images/epidemic.png',
					count: 5,
				},
				...this.cities.map((city) => ({
					name: city,
					type: 'City',
					image: `/images/cities/${city}.png`,
					count: 2,
				})),
			],
		};
	}

	toJSON() {
		return {
			cities: this.#cities,
		};
	}

	static fromJSON(json: JsonStructure) {
		const config = new Config();
		config.#cities = json.cities;
		return config;
	}

	static createDefault() {
		return new Config();
	}
}

type JsonStructure = ReturnType<Config['toJSON']>;
