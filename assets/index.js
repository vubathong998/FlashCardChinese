function main() {

    const urlData = '../data/data.xlsx';

    const btnChinese = document.getElementsByClassName('header_btn-chinese')[0];
    const btnBietnamese = document.getElementsByClassName('header_btn-vietnamese')[0];
    const btnEnglish = document.getElementsByClassName('header_btn-english')[0];
    const btnPinin = document.getElementsByClassName('header_btn-pinin')[0];
    const btnRandom = document.getElementsByClassName('header_btn-random')[0];
    const btnRank = document.getElementsByClassName('header_btn-rank')[0];

    const showSecond = document.getElementsByClassName('hide_second')[0];
    const showthird = document.getElementsByClassName('hide_third')[0];
    const showfourth = document.getElementsByClassName('hide_fourth')[0];

    const blockMainShow = document.getElementsByClassName('body_block-main_show')[0];
    const blockFirst = document.getElementsByClassName('body_block-first')[0];
    const blockSecond = document.getElementsByClassName('body_block-second')[0];
    const blockThird = document.getElementsByClassName('body_block-third')[0];
    const blockExample = document.getElementsByClassName('body_block-example')[0];

    const typingPlace = document.getElementsByClassName('typing-place')[0];

    //get data from google sheet
    fetch('https://docs.google.com/spreadsheets/d/1C_JtpNZzgy0iFdmt8oPAunVPQnihENhSIsD2L7H2Wd0/export?format=csv')
        .then(res => res.text())
        .then(csv => {
            const rows = csv
                .trim()
                .split('\n')
                .map(row => row.split(','));
            // Nếu muốn bỏ header
            const [header, ...data] = rows;
            return data;
        })
        .then(data => {
            handle(data);

        })
        .catch(err => console.error('Sheet error:', err));

    //get data from excel file
    // fetch(urlData)
    //     .then(res => res.arrayBuffer())
    //     .then(buffer => {
    //         const workbook = XLSX.read(buffer, { type: "array" });

    //         const firstSheetName = workbook.SheetNames[0];
    //         const sheet = workbook.Sheets[workbook.SheetNames[0]];

    //         const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    //         return data;
    //     })
    //     .then(data => {
    //         handle(data);
    //     })
    //     .catch(err => console.error(err));

    //main function
    function handle(data) {
        let dataMapped = mapper(data);
        // Filter out items with empty Chinese from the start
        dataMapped = dataMapped.filter(item => item.chinese && item.chinese.trim() !== '');
        let dataFiltered = [...dataMapped]; // Copy for filtering
        const appearingRanks = createRankFilterE(dataMapped);

        let currentIndex = null;
        let isShown = false;
        let selectedLanguage = 'chinese'; // Default: Chinese

        // Initialize with random item
        displayRandomItem();

        // Event Listeners
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                toggleDisplay();
            } else if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                displayRandomItem();
            }
        });

        btnRandom.addEventListener('click', displayRandomItem);

        // Language buttons
        btnChinese.addEventListener('click', () => selectLanguage('chinese'));
        btnBietnamese.addEventListener('click', () => selectLanguage('vietnamese'));
        btnEnglish.addEventListener('click', () => selectLanguage('english'));
        btnPinin.addEventListener('click', () => selectLanguage('pinin'));

        // Filter buttons
        btnRank.addEventListener('change', applyFilter);
        document.querySelector('.header_btn-point').addEventListener('change', applyFilter);

        function displayRandomItem() {
            if (dataFiltered.length === 0) {
                blockMainShow.textContent = 'No data';
                return;
            }
            currentIndex = randomNumber(dataFiltered.length);
            isShown = false;
            updateDisplay();
        }

        function toggleDisplay() {
            isShown = !isShown;
            updateDisplay();
        }

        function updateDisplay() {
            const item = dataFiltered[currentIndex];
            if (!item) return;

            // Map language to field layout
            const languageMap = {
                'chinese': {
                    main: 'chinese',
                    first: 'vietnamese'
                },
                'vietnamese': {
                    main: 'vietnamese',
                    first: 'chinese'
                },
                'english': {
                    main: 'english',
                    first: 'chinese'
                },
                'pinin': {
                    main: 'pinin',
                    first: 'chinese'
                }
            };

            const config = languageMap[selectedLanguage];

            if (!isShown) {
                // Hide - only show main block
                blockMainShow.textContent = getFieldValue(item, config.main);
                blockFirst.textContent = '****';
                blockSecond.textContent = '****';
                blockThird.textContent = '****';
                blockExample.textContent = '****';
            } else {
                // Show all
                blockMainShow.textContent = getFieldValue(item, config.main);
                blockFirst.textContent = getFieldValue(item, config.first);
                blockSecond.textContent = `${item.pinin || ''} (${item.classPinin || ''})`;
                blockThird.textContent = item.english || '';
                blockExample.textContent = item.example || '';
            }
        }

        function getFieldValue(item, field) {
            switch (field) {
                case 'chinese': return item.chinese || '';
                case 'vietnamese': return item.vietnamese || '';
                case 'english': return item.english || '';
                case 'pinin': return `${item.pinin || ''} (${item.classPinin || ''})`;
                default: return '';
            }
        }

        function selectLanguage(lang) {
            selectedLanguage = lang;
            updateDisplay();
            updateButtonStates(lang);
        }

        function updateButtonStates(lang) {
            [btnChinese, btnBietnamese, btnEnglish, btnPinin].forEach(btn => btn.classList.remove('bg-purple-500', 'text-white'));

            const buttonMap = {
                'chinese': btnChinese,
                'vietnamese': btnBietnamese,
                'english': btnEnglish,
                'pinin': btnPinin
            };

            if (buttonMap[lang]) {
                buttonMap[lang].classList.add('bg-purple-500', 'text-white');
            }
        }

        function applyFilter() {
            const selectedRank = btnRank.value;
            const selectedPoint = document.querySelector('.header_btn-point').value;

            dataFiltered = dataMapped.filter(item => {
                const rankMatch = selectedRank === '0' || item.rank === selectedRank;
                const pointMatch = selectedPoint === '0' || String(item.point) === selectedPoint;
                const hasChineseMatch = item.chinese && item.chinese.trim() !== '';
                return rankMatch && pointMatch && hasChineseMatch;
            });

            if (dataFiltered.length > 0) {
                displayRandomItem();
            } else {
                blockMainShow.textContent = 'No matching items';
            }
        }

        function createRankFilterE(dataMapped) {
            let appearingRanks = [];
            if (dataMapped.length > 0) {
                appearingRanks.push(dataMapped[0].rank);
            }
            dataMapped.forEach(item => {
                if (item.rank) {
                    let isDuplicate = false;
                    for (let i = 0; i < appearingRanks.length; i++) {
                        if (item.rank === appearingRanks[i]) {
                            isDuplicate = true;
                            break;
                        }
                    }
                    if (!isDuplicate) {
                        appearingRanks.push(item.rank);
                    }
                }
            });

            // const uniqueRanks = [...new Set(dataMapped.map(item => item.rank))];
            appearingRanks.forEach(rank => {
                const option = document.createElement('option');
                option.value = rank;
                option.textContent = rank;
                btnRank.appendChild(option);

            });
            return appearingRanks;
        }

        // Set initial language button state
        updateButtonStates('chinese');

    }

    function mapper(dataMapper) {
        let dataMapped = [];
        for (let i = 0; i < dataMapper.length; i++) {
            dataMapped.push({
                id: dataMapper[i][0],
                point: dataMapper[i][1],
                chinese: dataMapper[i][2],
                classifier: dataMapper[i][3],
                pinin: dataMapper[i][4],
                classPinin: dataMapper[i][5],
                english: dataMapper[i][6],
                vietnamese: dataMapper[i][7],
                type: dataMapper[i][8],
                example: dataMapper[i][9],
                category: dataMapper[i][10],
                rank: dataMapper[i][11],
            })
        }
        console.log('Mapped data:', dataMapped);
        return dataMapped;
    }
    function randomNumber(number) {
        return Math.floor(Math.random() * number);
    }
}
main();