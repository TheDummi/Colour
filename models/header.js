const header = document.getElementById('header');

if (header) {
	header.innerHTML += `
    <a class="header-link" href="/">Home</a>
    <a class="header-link" href="/pages/news">News</a>
    <div id="menu" class="header-link">
        Socials
    
        <div id="options" class="hidden">
        <li><a href="https://www.facebook.com/Colourtheoneandonly" target="_blank">Facebook</a></li>
        <li><a href="https://www.instagram.com/colourtheoneandonly/" target="_blank">Instagram</a></li>
        <li><a href="https://www.youtube.com/channel/UCB7Ut11YYhtLi3_RidLaMlg" target="_blank">YouTube</a></li>
        <li><a href="https://open.spotify.com/artist/199B2dCRTpPAPqdoD5mKrk" target="_blank">Spotify</a></li>
        <li><a href="https://colourtheoneandonly.bandcamp.com/album/colour" target="_blank">Bandcamp</a></li>
        </div>
    </div>
    <a class="header-link" href="/pages/colour#contact">Contact</a>
`;
}

window.addEventListener('DOMContentLoaded', (event) => {
	const menu = document.getElementById('menu');
	const options = document.getElementById('options');

	if (menu) {
		menu.addEventListener('click', (event) => {
			const state = options.classList.contains('hidden');
			if (state) options.classList.remove('hidden');
			else options.classList.add('hidden');
		});
	}
});
