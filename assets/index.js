function main() {

    const urlData = '../data/data.xlsx';

    const btnChinese = document.getElementsByClassName('header_btn-chinese')[0];
    const btnBietnamese = document.getElementsByClassName('header_btn-vietnamese')[0];
    const btnEnglish = document.getElementsByClassName('header_btn-english')[0];
    const btnPinin = document.getElementsByClassName('header_btn-pinin')[0];
    const btnRandom = document.getElementsByClassName('header_btn-random')[0];
    const btnType = document.getElementsByClassName('header_btn-type')[0];

    const showSecond = document.getElementsByClassName('hide_second')[0];
    const showthird = document.getElementsByClassName('hide_third')[0];
    const showfourth = document.getElementsByClassName('hide_fourth')[0];

    const blockChinese = document.getElementsByClassName('body_block-chinese')[0];
    const blockVietnamese = document.getElementsByClassName('body_block-vietnamese')[0];
    const blockPinin = document.getElementsByClassName('body_block-pinin')[0];
    const blockEnglish = document.getElementsByClassName('body_block-english')[0];
    const blockExample = document.getElementsByClassName('body_block-example')[0];

    fetch(urlData)
        .then(res => res.arrayBuffer())
        .then(buffer => {
            const workbook = XLSX.read(buffer, { type: "array" });

            const firstSheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            return data;
        })
        .then(data => {
            data = data.slice(1)
            const dataLength = data.length;
            let dataMapped = [];

            for (let i = 0; i < dataLength; i++) {
                if (data[i][2]) {
                    dataMapped.push({
                        id: data[i][0],
                        point: data[i][1],
                        chinese: data[i][2],
                        classifier: data[i][3],
                        pinin: data[i][4],
                        classPinin: data[i][5],
                        english: data[i][6],
                        vietnamese: data[i][7],
                        // type: data[i][8],
                        example: data[i][9],
                        from: data[i][10],
                        type: data[i][11],
                    })
                }
            }

            let dataMappedlength = dataMapped.length;
            btnRandom.addEventListener('click', () => {
                randomAction();
            })

            document.addEventListener("keydown", function (event) {
                if (event.code === "Space" || event.code === 'ArrowRight') {
                    event.preventDefault(); // chặn scroll trang nếu cần
                    randomAction();
                }
                else if (event.code === 'NumpadEnter' || event.code === 'ControlLeft') {
                    event.preventDefault();
                    showPininAction();
                }
                else if (event.code === 'Numpad0' || event.code === 'KeyF') {
                    showVietnameseAction();
                }
                else if (event.code === 'NumpadAdd' || event.code === 'ShiftLeft') {
                    showEnglishAction();
                }
            });


            function randomAction() {
                if (dataMappedlength) {
                    const random = randomNumber(dataMappedlength);
                    reloadPage(random);
                }
            }

            showSecond.addEventListener('click', () => {
                showVietnameseAction();
            })

            function showVietnameseAction() {
                const isShow = blockVietnamese.getAttribute('is-show') === 'true' ? true : false;
                const dataVietnamese = blockVietnamese.getAttribute('data-vietnamese');
                if (isShow) {
                    blockVietnamese.setAttribute('is-show', false);
                    blockVietnamese.textContent = '*****';
                }
                else {
                    blockVietnamese.setAttribute('is-show', true);
                    if (dataVietnamese) {
                        blockVietnamese.textContent = dataVietnamese;
                    }
                    else {
                        blockVietnamese.textContent = '*****';
                    }
                }
            }


            showthird.addEventListener('click', () => {
                showPininAction();
            })

            function showPininAction() {
                const isShow = blockPinin.getAttribute('is-show') === 'true' ? true : false;

                const dataVietnamese = blockPinin.getAttribute('data-pinin');
                if (isShow) {
                    blockPinin.setAttribute('is-show', false);
                    blockPinin.textContent = '*****';
                }
                else {
                    blockPinin.setAttribute('is-show', true);
                    if (dataVietnamese) {
                        blockPinin.textContent = dataVietnamese;
                    }
                    else {
                        blockPinin.textContent = '*****';
                    }
                }
            }

            btnType.addEventListener('change', (d) => {
                const value = d.target.value;
                filter.type = value;

            })

            showfourth.addEventListener('click', () => {
                showEnglishAction();
            })

            function showEnglishAction() {
                const isShow = blockEnglish.getAttribute('is-show') === 'true' ? true : false;
                const dataVietnamese = blockEnglish.getAttribute('data-english');
                if (isShow) {
                    blockEnglish.setAttribute('is-show', false);
                    blockEnglish.textContent = '*****';
                }
                else {
                    blockEnglish.setAttribute('is-show', true);
                    if (dataVietnamese) {
                        blockEnglish.textContent = dataVietnamese;
                    }
                    else {
                        blockEnglish.textContent = '*****';
                    }
                }
            }

            function onFilterChange(key, value, filter) {
                dataMapped = [];
                for (let i = 0; i < dataLength; i++) {
                    if (data[i][2]) {
                        if (filter.type == '0') {
                            mapper(data[i])
                        }
                        else if (filter.type == '1') {
                            if (data[i][11] === 'H') {
                                mapper(data[i])
                            }
                        }
                        else if (filter.type === '2') {
                            if (data[i][11] == 'Major' || data[i][11] == 'major') {
                                mapper(data[i])
                            }
                        }
                        else if (filter.type == '3') {
                            if (!data[i][11]) {
                                mapper(data[i])
                            }
                        }
                    }
                }

                function mapper(dataMapper) {
                    dataMapped.push({
                        id: dataMapper[0],
                        point: dataMapper[1],
                        chinese: dataMapper[2],
                        classifier: dataMapper[3],
                        pinin: dataMapper[4],
                        classPinin: dataMapper[5],
                        english: dataMapper[6],
                        vietnamese: dataMapper[7],
                        example: dataMapper[9],
                        from: dataMapper[10],
                        type: dataMapper[11],
                    })
                }

                dataMappedlength = dataMapped.length;
                if (dataMappedlength) {
                    const random = randomNumber(dataMappedlength);
                    reloadPage(random);
                }
            }

            const filter = new Proxy(
                {
                    chinese: true,
                    vietnamese: false,
                    english: false,
                    pinin: false,
                    type: 0,
                    point: ""
                },
                {
                    set(target, key, value) {
                        if (target[key] === value) return true;

                        target[key] = value;
                        onFilterChange(key, value, target);
                        return true;
                    }
                }
            );

            function reloadPage(num) {
                blockChinese.textContent = dataMapped[num].chinese ? dataMapped[num].chinese : 'None';
                // blockVietnamese.textContent = dataMapped[num].vietnamese ? dataMapped[num].vietnamese : 'None';
                blockVietnamese.textContent = '*****';
                blockVietnamese.setAttribute('data-vietnamese', dataMapped[num].vietnamese ? dataMapped[num].vietnamese : 'None')
                blockPinin.textContent = '*****';
                blockPinin.setAttribute('data-pinin', dataMapped[num].pinin ? dataMapped[num].pinin : 'None')
                blockEnglish.textContent = '*****';
                blockEnglish.setAttribute('data-english', dataMapped[num].english ? dataMapped[num].english : 'None')
                blockExample.textContent = dataMapped[num].example ? dataMapped[num].example : 'None';
            }
            function randomNumber(number) {
                return Math.floor(Math.random() * number);
            }
        })
        .catch(err => console.error(err));


}
main();