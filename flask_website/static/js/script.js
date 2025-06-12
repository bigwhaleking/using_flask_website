// static/js/script.js

document.addEventListener('DOMContentLoaded', function() {

    // --- 0. 공통 데이터 및 헬퍼 함수 ---
    let ALL_CATEGORIES_DATA = null;

    function getAllCategoriesData() {
        if (ALL_CATEGORIES_DATA) {
            return ALL_CATEGORIES_DATA;
        }
        const data = {};
        const megaMenuColumns = document.querySelectorAll('.mega-menu .mega-menu-column');



        megaMenuColumns.forEach(column => {
            const mainCategoryNameElement = column.querySelector('h4');
            if (mainCategoryNameElement) {
                const mainCategoryName = mainCategoryNameElement.textContent.trim();
                const subCategoryLinks = column.querySelectorAll('ul li a');
                const subCategories = [];
                subCategoryLinks.forEach(link => {
                    subCategories.push({
                        id: link.dataset.category,
                        name: link.dataset.categoryName || link.textContent.trim()
                    });
                });
                if (subCategories.length > 0) {
                    data[mainCategoryName] = subCategories;
                }
            }
        });
        ALL_CATEGORIES_DATA = data;
        return ALL_CATEGORIES_DATA;
    }

    const REGIONS_DATA = {
        /* 이전 답변의 전체 지역 데이터와 동일하게 유지 */
        "서울특별시": ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
        "부산광역시": ["강서구", "금정구", "기장군", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구"],
        "대구광역시": ["남구", "달서구", "달성군", "동구", "북구", "서구", "수성구", "중구", "군위군"],
        "인천광역시": ["강화군", "계양구", "미추홀구", "남동구", "동구", "부평구", "서구", "연수구", "옹진군", "중구"],
        "광주광역시": ["광산구", "남구", "동구", "북구", "서구"],
        "대전광역시": ["대덕구", "동구", "서구", "유성구", "중구"],
        "울산광역시": ["남구", "동구", "북구", "울주군", "중구"],
        "세종특별자치시": ["세종특별자치시"],
        "경기도": ["수원시 장안구", "수원시 권선구", "수원시 팔달구", "수원시 영통구", "성남시 수정구", "성남시 중원구", "성남시 분당구", "의정부시", "안양시 만안구", "안양시 동안구", "부천시", "광명시", "평택시", "동두천시", "안산시 상록구", "안산시 단원구", "고양시 덕양구", "고양시 일산동구", "고양시 일산서구", "과천시", "구리시", "남양주시", "오산시", "시흥시", "군포시", "의왕시", "하남시", "용인시 처인구", "용인시 기흥구", "용인시 수지구", "파주시", "이천시", "안성시", "김포시", "화성시", "광주시", "양주시", "포천시", "여주시", "연천군", "가평군", "양평군"],
        "강원특별자치도": ["춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시", "홍천군", "횡성군", "영월군", "평창군", "정선군", "철원군", "화천군", "양구군", "인제군", "고성군", "양양군"],
        "충청북도": ["청주시 상당구", "청주시 서원구", "청주시 흥덕구", "청주시 청원구", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군", "진천군", "괴산군", "음성군", "단양군"],
        "충청남도": ["천안시 동남구", "천안시 서북구", "공주시", "보령시", "아산시", "서산시", "논산시", "계룡시", "당진시", "금산군", "부여군", "서천군", "청양군", "홍성군", "예산군", "태안군"],
        "전북특별자치도": ["전주시 완산구", "전주시 덕진구", "군산시", "익산시", "정읍시", "남원시", "김제시", "완주군", "진안군", "무주군", "장수군", "임실군", "순창군", "고창군", "부안군"],
        "전라남도": ["목포시", "여수시", "순천시", "나주시", "광양시", "담양군", "곡성군", "구례군", "고흥군", "보성군", "화순군", "장흥군", "강진군", "해남군", "영암군", "무안군", "함평군", "영광군", "장성군", "완도군", "진도군", "신안군"],
        "경상북도": ["포항시 남구", "포항시 북구", "경주시", "김천시", "안동시", "구미시", "영주시", "영천시", "상주시", "문경시", "경산시", "의성군", "청송군", "영양군", "영덕군", "청도군", "고령군", "성주군", "칠곡군", "예천군", "봉화군", "울진군", "울릉군"],
        "경상남도": ["창원시 의창구", "창원시 성산구", "창원시 마산합포구", "창원시 마산회원구", "창원시 진해구", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시", "양산시", "의령군", "함안군", "창녕군", "고성군", "남해군", "하동군", "산청군", "함양군", "거창군", "합천군"],
        "제주특별자치도": ["제주시", "서귀포시"]
    };

    // --- 1. 범용 드롭다운 호버 및 클릭 로직 (수정됨) ---
    const allDropdownWrappers = document.querySelectorAll('.custom-dropdown-wrapper');

    allDropdownWrappers.forEach(dropdownWrapper => {
        const triggerButton = dropdownWrapper.querySelector('.dropdown-trigger');
        const panelElement = dropdownWrapper.querySelector('.dropdown-panel');

        if (triggerButton && panelElement) {
            // 호버 기능
            dropdownWrapper.addEventListener('mouseenter', function() {
                // fixed-active 상태가 아닐 때만 hover-active 추가
                if (!this.classList.contains('fixed-active')) {
                    this.classList.add('hover-active');
                }
            });

            dropdownWrapper.addEventListener('mouseleave', function() {
                // fixed-active 상태가 아닐 때만 hover-active 제거
                if (!this.classList.contains('fixed-active')) {
                    this.classList.remove('hover-active');
                }
            });

            // 클릭으로 고정 기능
            triggerButton.addEventListener('click', function(event) {
                event.preventDefault();
                const currentlyFixed = dropdownWrapper.classList.contains('fixed-active');

                // 모든 드롭다운의 fixed-active 및 hover-active 상태 초기화
                allDropdownWrappers.forEach(dw => {
                    dw.classList.remove('fixed-active');
                    dw.classList.remove('hover-active');
                });

                // 현재 드롭다운이 이전에 고정되지 않았다면 고정
                if (!currentlyFixed) {
                    dropdownWrapper.classList.add('fixed-active');
                    dropdownWrapper.classList.add('hover-active'); // 클릭 시 바로 보이도록
                }
                // 이미 고정된 상태에서 다시 클릭하면 고정 해제 (위에서 초기화되었으므로 추가 동작 불필요)
            });

            // "전체 카테고리" (메인 네비) 드롭다운의 하위 링크 클릭 시 특별 동작
            if (dropdownWrapper.classList.contains('main-category-nav-dropdown')) {
                const megaMenuLinks = panelElement.querySelectorAll('a[data-category]');
                megaMenuLinks.forEach(link => {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        const categoryId = this.dataset.category;
                        const categoryName = this.dataset.categoryName || this.textContent.trim();
                        window.location.href = `/main?selected_category_id=${encodeURIComponent(categoryId)}&selected_category_name=${encodeURIComponent(categoryName)}`;
                        // 페이지 이동 후에는 fixed-active 등이 자동으로 해제됨
                    });
                });
            }

            // SRP 카테고리 필터의 하위 링크 클릭 시
            if (dropdownWrapper.id === 'srp-category-filter') {
                panelElement.addEventListener('click', function(e) { // 이벤트 위임 사용
                    if (e.target.tagName === 'A' && e.target.closest('.sub-category-list')) {
                        e.preventDefault();
                        window.location.href = e.target.href;
                    }
                });
            }

            // SRP 지역 필터의 하위 항목(시/군/구) 클릭 시
            if (dropdownWrapper.id === 'srp-region-filter') {
                const cityColumn = panelElement.querySelector('#srp-region-city-column');
                if (cityColumn) {
                    cityColumn.addEventListener('click', function(e) {
                        if (e.target.tagName === 'LI') { // 시/군/구 li 태그 클릭 시
                            const regionTriggerText = dropdownWrapper.querySelector('.trigger-text');
                            const provinceName = e.target.closest('.region-filter-panel').querySelector('#srp-region-province-column li.current-hover')?.dataset.province || '';
                            const cityName = e.target.textContent;

                            if (regionTriggerText && provinceName && cityName) {
                                regionTriggerText.textContent = `${provinceName} ${cityName}`;
                            }

                            // 선택 후 드롭다운 닫기
                            dropdownWrapper.classList.remove('fixed-active');
                            dropdownWrapper.classList.remove('hover-active');

                            console.log(`SRP 지역 선택: ${provinceName} ${cityName}`);
                            // 실제 필터링 URL 변경 또는 AJAX 로직은 여기에
                            // 예: window.location.href = `/main?region=${encodeURIComponent(provinceName)}-${encodeURIComponent(cityName)}`;
                        }
                    });
                }
            }
        }
    });

    // 문서 전체 클릭 시 모든 fixed-active 드롭다운 닫기
    document.addEventListener('click', function(event) {
        // 클릭된 요소가 드롭다운 내부가 아니면 모든 fixed-active 상태를 해제
        if (!event.target.closest('.custom-dropdown-wrapper')) {
            allDropdownWrappers.forEach(dropdownWrapper => {
                dropdownWrapper.classList.remove('fixed-active');
                dropdownWrapper.classList.remove('hover-active');
            });
        }
    });

    // --- 2. SRP (검색 결과 페이지 - main.html) 관련 초기화 로직 ---
    const srpPageContainer = document.querySelector('.srp-controls-bar');
    if (srpPageContainer) {
        const categoriesData = getAllCategoriesData();

        const srpCategoryFilter = document.getElementById('srp-category-filter');
        if (srpCategoryFilter) {
            const categoryTriggerText = srpCategoryFilter.querySelector('.trigger-text');
            const categoryMainList = srpCategoryFilter.querySelector('.category-filter-main-list');
            const categorySubListArea = srpCategoryFilter.querySelector('.category-filter-sub-list-area');

            if (categoryMainList && categorySubListArea && Object.keys(categoriesData).length > 0) {
                for (const mainCatName in categoriesData) {
                    const mainCatEl = document.createElement('div');
                    mainCatEl.classList.add('main-category-title');
                    mainCatEl.textContent = mainCatName;
                    mainCatEl.dataset.mainCategorySrp = mainCatName;
                    categoryMainList.appendChild(mainCatEl);

                    mainCatEl.addEventListener('mouseenter', function() {
                        categoryMainList.querySelectorAll('.main-category-title').forEach(el => el.classList.remove('current-hover'));
                        this.classList.add('current-hover');

                        const subCats = categoriesData[this.dataset.mainCategorySrp] || [];
                        categorySubListArea.innerHTML = '';

                        if (subCats.length > 0) {
                            const ul = document.createElement('ul');
                            ul.classList.add('sub-category-list');
                            subCats.forEach(subCat => {
                                const li = document.createElement('li');
                                const a = document.createElement('a');
                                // SRP 카테고리 선택 시 URL 이동
                                a.href = `/main?selected_category_id=${encodeURIComponent(subCat.id)}&selected_category_name=${encodeURIComponent(subCat.name)}`;
                                a.textContent = subCat.name;
                                a.dataset.categoryId = subCat.id; // JS에서 사용 가능하도록 데이터 저장
                                a.dataset.categoryName = subCat.name;
                                // 클릭 이벤트는 상위 panelElement에서 위임하여 처리하므로 여기서는 개별 추가 안함
                                li.appendChild(a);
                                ul.appendChild(li);
                            });
                            categorySubListArea.appendChild(ul);
                        }
                    });
                }
            }

            const urlParams = new URLSearchParams(window.location.search);
            const selectedCategoryIdFromUrl = urlParams.get('selected_category_id');
            const selectedCategoryNameFromUrl = urlParams.get('selected_category_name');

            if (selectedCategoryIdFromUrl && selectedCategoryNameFromUrl && categoryTriggerText) {
                categoryTriggerText.textContent = selectedCategoryNameFromUrl;
                for (const mainCatName in categoriesData) {
                    const foundSubCat = categoriesData[mainCatName].find(sc => sc.id === selectedCategoryIdFromUrl);
                    if (foundSubCat) {
                        const mainCatElementForHover = categoryMainList.querySelector(`[data-main-category-srp="${mainCatName}"]`);
                        if (mainCatElementForHover) {
                            mainCatElementForHover.dispatchEvent(new MouseEvent('mouseenter'));
                            setTimeout(() => {
                                const subCatLinks = categorySubListArea.querySelectorAll('.sub-category-list li a');
                                subCatLinks.forEach(link => {
                                    if (link.dataset.categoryId === selectedCategoryIdFromUrl) {
                                        link.classList.add('selected');
                                    }
                                });
                            }, 0);
                        }
                        break;
                    }
                }
            }
        }

        const srpRegionFilter = document.getElementById('srp-region-filter');
        if (srpRegionFilter) {
            const regionTriggerText = srpRegionFilter.querySelector('.trigger-text');
            const provinceColumn = document.getElementById('srp-region-province-column');
            const cityColumn = document.getElementById('srp-region-city-column');

            if (provinceColumn && cityColumn && Object.keys(REGIONS_DATA).length > 0) {
                const provinceUl = document.createElement('ul');
                for (const provinceName in REGIONS_DATA) {
                    const li = document.createElement('li');
                    li.textContent = provinceName;
                    li.dataset.province = provinceName;
                    provinceUl.appendChild(li);

                    li.addEventListener('mouseenter', function() {
                        provinceColumn.querySelectorAll('li').forEach(el => el.classList.remove('current-hover'));
                        this.classList.add('current-hover');

                        const cities = REGIONS_DATA[this.dataset.province] || [];
                        cityColumn.innerHTML = '';

                        if (cities.length > 0) {
                            const cityUl = document.createElement('ul');
                            cities.forEach(cityName => {
                                const cityLi = document.createElement('li');
                                cityLi.textContent = cityName;
                                // 클릭 이벤트는 상위 cityColumn에서 위임하여 처리
                                cityUl.appendChild(cityLi);
                            });
                            cityColumn.appendChild(cityUl);
                        }
                    });
                }
                provinceColumn.appendChild(provinceUl);
            }
            // URL에서 지역 정보 가져와서 설정 (필요하다면)
            // const regionFromUrl = urlParams.get('region');
            // if (regionFromUrl && regionTriggerText) {
            //    regionTriggerText.textContent = decodeURIComponent(regionFromUrl).replace('-', ' ');
            // }
        }

        const sortButtons = document.querySelectorAll('.srp-sort-button');
        sortButtons.forEach(button => {
            /* ... 정렬 버튼 로직 동일 ... */ });
    }

    // --- 3. 게시판 페이지 스크립트 (community.html) ---
    const boardPage = document.querySelector('.board-page-container');
    if (boardPage) {
        const boardMenuItems = boardPage.querySelectorAll('.board-menu-item');
        const boardTitle = boardPage.querySelector('#board-title');
        const postListBody = boardPage.querySelector('#post-list-body');
        const searchInput = boardPage.querySelector('#board-search-input');
        const searchButton = boardPage.querySelector('#board-search-button');
        let storage_community = {}

        function loadPosts(category = 'notice', page = 1) {
            if (category === 'search') {
                const searchPosts = storage_community.search || [];

                postListBody.innerHTML = '';
                boardTitle.textContent = '검색 결과';

                if (searchPosts.length === 0) {
                    postListBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color: #999;">검색 결과가 없습니다.</td></tr>`;
                    return;
                }

                searchPosts.forEach(post => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${post.index || ''}</td>
                        <td>${post.type}</td>
                        <td class="col-title"><a href="/community_page?item_id=${post.id}">${post.title}</a></td>
                        <td>${post.author}</td>
                        <td>${post.date}</td>
                        <td>${(post.views || 0).toLocaleString()}</td>
                    `;
                    postListBody.appendChild(row);
                });
                return;
            }

            fetch(`/community_post?category=${category}&page=${page}`)
                .then(res => res.json())
                .then(data => {
                    const noticePosts = data.notices || [];
                    const normalPosts = data.posts.filter(post => post.type !== '공지');

                    storage_community[category] = data.posts;

                    const boardName = document.querySelector(`.board-menu-item[data-board-id="${category}"]`)?.dataset.boardName || '게시판';
                    boardTitle.textContent = boardName;
                    postListBody.innerHTML = '';

                    renderPaginationControls(data.current_page, data.total_pages, category);

                    noticePosts.forEach(post => {
                        const row = document.createElement('tr');
                        row.classList.add('notice-row');
                        row.innerHTML = `
                            <td><span class="notice-badge">공지</span></td>
                            <td>${post.type}</td>
                            <td class="col-title"><a href="/community_page?item_id=${post.id}">${post.title}</a></td>
                            <td>${post.author}</td>
                            <td>${post.date}</td>
                            <td>${post.views.toLocaleString()}</td>
                        `;
                        postListBody.appendChild(row);
                    });
                    
                    if (data.posts.length === 0) {
                        postListBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color: #999;">게시글이 없습니다.</td></tr>`;
                        return;
                    }

                    normalPosts.forEach(post => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${post.index}</td>
                            <td>${post.type}</td>
                            <td class="col-title"><a href="/community_page?item_id=${post.id}">${post.title}</a></td>
                            <td>${post.author}</td>
                            <td>${post.date}</td>
                            <td>${post.views.toLocaleString()}</td>
                        `;
                        postListBody.appendChild(row);
                    });
                }
            );
        }

        function renderPaginationControls(current, total, category) {
            const container = document.getElementById('pagination-container');
            container.innerHTML = '';

            if (total === 0) return;

            for (let i = 1; i <= total; i++) {
                const pageLink = document.createElement('a');
                pageLink.href = '#';
                pageLink.textContent = i;
                pageLink.className = 'page-link' + (i === current ? ' active' : '');
                pageLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadPosts(category, i);
                });
                container.appendChild(pageLink);
            }
        }
        
        boardMenuItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                boardMenuItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                const boardId = this.dataset.boardId;
                loadPosts(boardId, 1);
                const currentUrl = new URL(window.location.href);
                if (currentUrl.searchParams.has('board_to_show')) {
                    currentUrl.searchParams.delete('board_to_show');
                    history.replaceState(null, '', currentUrl.toString());
                }
            });
        });

        if (searchButton && searchInput) {
            searchButton.addEventListener('click', function() {
                const searchTerm = searchInput.value.trim().toLowerCase();
                if (searchTerm) {
                    let allPosts = [];
                    Object.keys(storage_community).forEach(key=>{
                        if ( key !== 'search' ) {
                            allPosts = allPosts.concat(storage_community[key]);
                        }
                    });

                    const searchPosts = allPosts.filter(post=>
                        post.title && post.title.toLowerCase().includes(searchTerm)
                    );

                    storage_community.search = searchPosts;
                    loadPosts('search');
                }
            });
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchButton.click();
                }
            });
        }

        const urlParams = new URLSearchParams(window.location.search);
        const initialCategory = urlParams.get('board_to_show') || 'notice';
        loadPosts(initialCategory, 1);
        const defaultBoardId = '';
        let initialBoardId = defaultBoardId;
        if (boardToShow) {
            const targetMenuItem = boardPage.querySelector(`.board-menu-item[data-board-id="${boardToShow}"]`);
            if (targetMenuItem) {
                initialBoardId = boardToShow;
                boardMenuItems.forEach(i => i.classList.remove('active'));
                targetMenuItem.classList.add('active');
            }
        }
        loadPosts(initialBoardId);
    }

    // --- 4. 마이페이지 스크립트 (my_page.html) ---
    const myPage = document.querySelector('.my-page-container');
    if (myPage) {
        const userNameField = myPage.querySelector('#user-name');
        const userAddressField = myPage.querySelector('#user-address');
        const userPhoneField = myPage.querySelector('#user-phone');
        const editProfileButton = myPage.querySelector('#edit-profile-button');
        const saveProfileButton = myPage.querySelector('#save-profile-button');
        const cancelEditButton = myPage.querySelector('#cancel-edit-button');
        const findAddressButton = myPage.querySelector('#find-address-button');

        function setFieldsReadOnly(isReadOnly) {
            if (userNameField) userNameField.readOnly = isReadOnly;
            if (userAddressField) userAddressField.readOnly = isReadOnly;
            if (userPhoneField) userPhoneField.readOnly = isReadOnly;

            [userNameField, userAddressField, userPhoneField].forEach(field => {
                if (field) {
                    field.classList.toggle('form-control-readonly-style', isReadOnly);
                }
            });

            if (editProfileButton) editProfileButton.style.display = isReadOnly ? 'inline-flex' : 'none';
            if (saveProfileButton) saveProfileButton.style.display = isReadOnly ? 'none' : 'inline-flex';
            if (cancelEditButton) cancelEditButton.style.display = isReadOnly ? 'none' : 'inline-block';
            if (findAddressButton) findAddressButton.style.display = isReadOnly ? 'none' : 'inline-block';
        }

        if (editProfileButton) {
            editProfileButton.addEventListener('click', function() {
                setFieldsReadOnly(false);
                if (userNameField) userNameField.focus();
            });
        }

        if (cancelEditButton) {
            cancelEditButton.addEventListener('click', function() {
                if (userNameField) userNameField.value = originalUserInfo.name || '';
                if (userAddressField) userAddressField.value = originalUserInfo.address || '';
                if (userPhoneField) userPhoneField.value = originalUserInfo.phone || '';
                setFieldsReadOnly(true);
            });
        }

        const userProfileForm = myPage.querySelector('#user-profile-form');
        if (userProfileForm && saveProfileButton) {
            userProfileForm.addEventListener('submit', function(event) {
                const updatedUserInfo = {
                    name: userNameField ? userNameField.value.trim() : '',
                    address: userAddressField ? userAddressField.value.trim() : '',
                    phone: userPhoneField ? userPhoneField.value.trim() : ''
                };
                if (!updatedUserInfo.name || !updatedUserInfo.address || !updatedUserInfo.phone) {
                    alert('모든 정보를 입력해주세요.');
                    event.preventDefault();
                    return;
                }
                if (!/^\d{3}-\d{3,4}-\d{4}$/.test(updatedUserInfo.phone)) {
                    alert('올바른 전화번호 형식(010-1234-5678)으로 입력해주세요.');
                    event.preventDefault();
                    return;
                }
                // localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
                // originalUserInfo = {
                //     ...updatedUserInfo
                // };
                alert('회원 정보가 저장되었습니다.');
                setFieldsReadOnly(true);
            });
        }

        if (findAddressButton) {
            findAddressButton.addEventListener('click', function() {
                alert('주소 검색 기능은 현재 지원되지 않습니다. (카카오 주소 API 등 연동 필요)');
            });
        }
        loadUserProfile();
        setFieldsReadOnly(true);
    }

    // --- 5. 판매하기 페이지 스크립트 (sell_item.html) ---
    const sellItemPage = document.querySelector('.sell-item-page-container');
    if (sellItemPage) {
        const itemCategorySelect = sellItemPage.querySelector('#item-category-select');
        if (itemCategorySelect) {
            const categoriesForSell = getAllCategoriesData();
            for (const mainCategory in categoriesForSell) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = mainCategory;
                categoriesForSell[mainCategory].forEach(subCategory => {
                    const option = document.createElement('option');
                    option.value = subCategory.id;
                    option.textContent = subCategory.name;
                    optgroup.appendChild(option);
                });
                itemCategorySelect.appendChild(optgroup);
            }
        }

        const photoInputs = sellItemPage.querySelectorAll('.item-photo-input');
        photoInputs.forEach(input => {
            input.addEventListener('change', function(event) {
                const slot = this.closest('.photo-upload-slot');
                const previewImg = slot.querySelector('.photo-preview');
                const file = event.target.files[0];
                if (file && previewImg) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        previewImg.src = e.target.result;
                        previewImg.style.display = 'block';
                        slot.classList.add('has-image');
                    };
                    reader.readAsDataURL(file);
                } else if (previewImg) {
                    previewImg.src = '#';
                    previewImg.style.display = 'none';
                    slot.classList.remove('has-image');
                }
            });
        });

        const sellItemForm = sellItemPage.querySelector('#sell-item-form');
        if (sellItemForm) {
            sellItemForm.addEventListener('submit', function(event) {
                const title = sellItemPage.querySelector('#item-title').value;
                const category = itemCategorySelect.value;
                const price = sellItemPage.querySelector('#item-price').value;
                const description = sellItemPage.querySelector('#item-description').value;
                if (!title || !category || !price || !description) {
                    alert('모든 필수 항목을 입력해주세요.');
                    event.preventDefault();
                    return;
                }
                if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
                    alert('올바른 가격을 입력해주세요.');
                    event.preventDefault();
                    return;
                }
            });
        }

        const cancelSellButton = sellItemPage.querySelector('#cancel-sell-button');
        if (cancelSellButton) {
            cancelSellButton.addEventListener('click', function() {
                if (confirm('작성을 취소하시겠습니까? 입력한 내용은 저장되지 않습니다.')) {
                    window.location.href = document.referrer || '/main';
                }
            });
        }

        const urlParamsForSell = new URLSearchParams(window.location.search);
        if (urlParamsForSell.get('item_posted') === 'true') {
            alert('상품이 성공적으로 등록되었습니다!');
            const cleanUrl = window.location.href.split('?')[0];
            history.replaceState(null, '', cleanUrl);
        }
    }

    // --- 6. 글쓰기 페이지 스크립트 (write_post.html) ---
    const writePostPage = document.querySelector('.write-post-page-container');
    if (writePostPage) {
        const postForm = writePostPage.querySelector('#post-form');
        const boardCategorySelect = writePostPage.querySelector('#board-category-select');
        const postTitleInput = writePostPage.querySelector('#post-title');
        const postContentArea = writePostPage.querySelector('#post-content');

        if (postForm) {
            postForm.addEventListener('submit', function(event) {
                event.preventDefault();
                const boardCategory = boardCategorySelect.value;
                const postTitle = postTitleInput.value.trim();
                const postContent = postContentArea.value.trim();
                if (!boardCategory) {
                    alert('게시판을 선택해주세요.');
                    boardCategorySelect.focus();
                    return;
                }
                if (!postTitle) {
                    alert('제목을 입력해주세요.');
                    postTitleInput.focus();
                    return;
                }
                if (!postContent) {
                    alert('내용을 입력해주세요.');
                    postContentArea.focus();
                    return;
                }
                console.log('등록할 게시글 정보:', {
                    category: boardCategory,
                    title: postTitle,
                    content: postContent
                });
                alert('게시글이 등록되었습니다!');
                postForm.reset();
            });
        }

        const cancelPostButton = writePostPage.querySelector('#cancel-post-button');
        if (cancelPostButton) {
            cancelPostButton.addEventListener('click', function() {
                if (confirm('작성을 취소하시겠습니까? 입력한 내용은 저장되지 않습니다.')) {
                    window.location.href = document.referrer || '/community';
                }
            });
        }
    }

    // --- 7. 아이디 중복 확인 ---
    const register = document.querySelector('.btn-check-duplicate')
    if (register) {
        register.addEventListener('click', function () {
        const idInput = document.querySelector('#id');
        const userId = idInput.value.trim();

        if (!userId) {
            alert('아이디를 입력하세요.');
            return;
        }

        fetch('/check_duplicate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: userId }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.exists) {
                    alert('이미 존재하는 아이디입니다.');
                } else {
                    alert('사용 가능한 아이디입니다.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('중복 확인 중 오류가 발생했습니다.');
            });
        });
    }

}); // END DOMContentLoaded