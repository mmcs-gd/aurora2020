export const messages = [
	'Well done Eleven! Hopper says they are left: ',
	'Cool, keep it up, left: ',
	'Come on, you can, take revenge on all ',
	'Our team is always with you, left: ',
	'Hey! Hit them! Left: ',
	'Come on, Eleven, you are cool!: '
]

export const names = [
	'WILL',
	'MIKE',
	'LUCAS',
	'MAX',
	'DUSTIN',
	'HOPPER',
	'HOPPER',
	'JONATHAN',
]


export const getMessage = (scene, count) => {
	const message = messages[Math.floor(Math.random() * messages.length)];
	const name = names[Math.floor(Math.random() * names.length)];

	const text = scene.add.text(
		scene.player.x, scene.player.y,
		count > 0 ? `${name}: ${message}${count}` : `${name}: Well done! You are win! Click Esc!`,
		{
			fill: '#aaa',
			backgroundColor: '#ededed',
			padding: {
				x : 8,
				y : 8
			},
			fontSize: 12,
			alpha : 0
		}
	)
	scene.tweens.add({
		targets: text,
		alpha: {from : 0, to : 1},
		y: '+=4',
		ease: 'Linear',
		duration: 200,
		repeat: 0
	});

	scene.tweens.add({
		targets: text,
		alpha: {from : 1, to : 0},
		ease: 'Linear',
		y: '+=4',
		delay: 3600,
		duration: 200,
		repeat: 0
	});
}