function addNewRuleToMatcher(matcher, from, to) {
	if (matcher[from] && matcher[from] != to) {
		const newFrom = Math.max(to, matcher[from]);
		const newTo = Math.min(to, matcher[from]);
		addNewRuleToMatcher(matcher, newFrom, newTo);
	}
	matcher[from] = to;
}

function marking(map) {
	let label = 1;
	let fl = false; //взводим true, когда фон пойдет во второй раз (или сразу наткнемся на объект)
	let result = [];
	let matcher = []; // для переходов-конфликтов

	let fields = [];


	//Разметка
	for (let i = 0; i < map.length; ++i) {
		result[i] = [];
		for (let j = 0; j < map[0].length; ++j) {
			switch (map[i][j]) {
				case 0:
					if (fl) {
						++label;
						fl = false;
					}
					result[i][j] = 0;
					break;

				default:
					fl = true;
					if (!i)
						result[i][j] = label;
					else {
						//проверяем номера соседей (4-х связные соседи)
						const top = result[i - 1][j];
						const left = !j ? 0 : result[i][j - 1];
						if (top == left) {
							result[i][j] = top ? top : label;
						}
						else if (!top || !left) {
							result[i][j] = Math.max(top, left);
						} else {
							let max = Math.max(top, left);
							let min = Math.min(top, left);
							result[i][j] = max;
							addNewRuleToMatcher(matcher, max, min);
						}
					}
					break;
			}
		}
		++label;
	}

	console.log(matcher)

	//Переразметка с учетом переходов (и сразу запихивание в список??)
	for (let i = 0; i < map.length; ++i) {
		for (let j = 0; j < map[0].length; ++j) {
			const item = result[i][j];
			if (item) {
				//переразметка
				if (matcher[item]) {
					let m = matcher[item]
					while (matcher[m])
						m = matcher[m];
					result[i][j] = m;
				}
				//учет областей
				let field = fields[result[i][j]];
				if (!field) {
					fields[result[i][j]] = { left: i, right: i, top: j, bottom: j, pixels: 1 };
				} else {
					++field.pixels;
					field.left = Math.min(field.left, i);
					field.right = Math.max(field.right, i);
					field.top = Math.max(field.top, j);
					field.bottom = Math.min(field.bottom, j);
					fields[result[i][j]] = field;
				}
			}
		}
	}

	//console.log(result)
	//console.log(fields);
	return fields.filter(x=>x).length;
}

export { marking }