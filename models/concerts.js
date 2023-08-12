/** @format */

const concerts = document.getElementById('Concerts');
const upcoming = document.getElementById('upcoming');
const past = document.getElementById('past');

if (document.URL.includes('colour')) {
	const links = [
		{
			name: 'aaa',
			link: 'https://google.com',
			date: '2 september 2023',
		},
		{
			name: 'aaa',
			link: 'https://google.com',
			date: '2 september 2023',
		},
		{
			name: 'aaa',
			link: 'https://google.com',
			date: '2 september 2022',
		},
		{
			name: 'aaa',
			link: 'https://google.com',
			date: '2 september 2022',
		},
		// {
		// 	name: 'aaa',
		// 	link: 'https://google.com',
		// 	date: '2 september 2022',
		// },
		// {
		// 	name: 'bbb',
		// 	link: 'https://google.com',
		// 	date: '2 september 2022',
		// },
		// {
		// 	name: 'bbb',
		// 	link: 'https://google.com',
		// 	date: '2 september 2022',
		// },
		// {
		// 	name: 'bbb',
		// 	link: 'https://google.com',
		// 	date: '2 september 2022',
		// },
		// {
		// 	name: 'bbb',
		// 	link: 'https://google.com',
		// 	date: '2 september 2022',
		// },
	]
		.map((link) => ({ ...link, date: new Date(link.date), type: new Date() < new Date(link.date) ? 'upcoming' : 'past' }))
		.sort((a, b) => b.date - a.date);

	for (const link of links) {
		if (link.type == 'upcoming') {
			const cab = document.createElement('div');

			cab.classList.add('cab');

			cab.innerHTML = `<h2>Upcoming</h2>`;

			upcoming.appendChild(cab);
		}

		if (link.type == 'past') {
			const cab = document.createElement('div');

			cab.classList.add('cab');

			cab.innerHTML = `<h2>Past</h2>`;

			past.appendChild(cab);
		}
	}
}
