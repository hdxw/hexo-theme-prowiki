//===========文章解密回调监听，改变锁图标===========
window.addEventListener('hexo-blog-decrypt', function(e){
    $('.fa-lock').each(function(i){
        $(this).removeClass('fa-lock');
        $(this).addClass('fa-unlock-alt');
    });
    $('.article-toc').css("display","block");
});

//===========锚点定位，页面滚动===========
// 页面滚动动画
function scroll_animate(top) {
    $("html,body").animate({scrollTop: top}, 300);
}
// 返回顶部按钮
$('#gotop').click(() => scroll_animate(0));
// 定位到h1,h2,h3,h4,h5,h6标签
function gotohn(link){
    let scrollH = $(decodeURI($(link).attr("href"))).offset().top-50;
    scroll_animate(scrollH);
    $("#gotop").css("display", scrollH < 200?"none":"block");
}
// 遍历toc锚点，直接定位改为动画滑动
$(".toc-link").each(function(i,link){
    $(link).attr("onclick","gotohn(this);");
})
//绑定滚动事件
window.onscroll = function(ev) {
    let scrollH = $(window).scrollTop();// 当前滚动条位置
    if($(".toc-link")){
        //高亮导航菜单
        $(".toc-link").each(function(i,link){
            var offsetTop = $(decodeURI($(link).attr("href"))).offset().top-50;
            if(scrollH+1 > offsetTop){
                $('.toc-link').removeClass('on');
                $(link).addClass('on');
            }
        });
    }
    //返回顶部显隐
    $("#gotop").css("display", scrollH < 200?"none":"block");
}

//===========代码复制按钮==========
function wait(callback, seconds) {
    var timelag = null;
    timelag = window.setTimeout(callback, seconds);
}
var clipboard = new ClipboardJS('.btn-copy', {
    target: function(trigger) {
        return trigger.nextElementSibling;
    }
});
clipboard.on('success', function(e) {
    let $btn = $(e.trigger);
    $btn.addClass('copied');
    let $icon = $($btn.find('i'));
    $icon.removeClass('fa-copy');
    $icon.addClass('fa-check-circle');
    let $span = $($btn.find('span'));
    $span[0].innerText = '完成';
    
    wait(function () { // 等待两秒钟后恢复
        $icon.removeClass('fa-check-circle');
        $icon.addClass('fa-copy');
        $span[0].innerText = '复制';
    }, 2000);
});
clipboard.on('error', function(e) {
    e.clearSelection();
    let $btn = $(e.trigger);
    $btn.addClass('copy-failed');
    let $icon = $($btn.find('i'));
    $icon.removeClass('fa-copy');
    $icon.addClass('fa-times-circle');
    let $span = $($btn.find('span'));
    $span[0].innerText = '失败';
    
    wait(function () { // 等待两秒钟后恢复
        $icon.removeClass('fa-times-circle');
        $icon.addClass('fa-copy');
        $span[0].innerText = '复制';
    }, 2000);
});
//==========gallery图片集切换==========
function show_left(){
    if($(".photo-list").length>0){
        var index = $(".photo-list").find(".photo-show").index()-1;
        index = index>=0?index:($('.photo-item').length - 1);
        $('.photo-item').removeClass('photo-show');
        $($('.photo-item')[index]).addClass('photo-show');
    }
}
function show_right(){
    if($(".photo-list").length>0){
        var index = $(".photo-list").find(".photo-show").index()+1;
        index = index>=$('.photo-item').length?0:index;
        $('.photo-item').removeClass('photo-show');
        $($('.photo-item')[index]).addClass('photo-show');
    }
}
//==========搜索功能==========
$("button.btn-search").click(function(sb) {
    $(".search-overlay").css("display","block");
    $(this).hide();
});
$(".search-overlay").click(function() {
    $(this).hide();
    $("button.btn-search").show();
});
// 点搜索界面不隐藏
$(".search-overlay").on("click",".search-box", function(e){
    e.stopPropagation()
});
const input = document.querySelector('.search-input');
const container = document.querySelector('.search-body');
$("button.search-button").click(do_search);
$(".search-input").keyup(function(event) {
    if (event.keyCode === 13) {
        do_search();
    }
});
if(CONFIG.localsearch.auto_trigger){
    input.addEventListener('input', do_search);
}
const localSearch = new LocalSearch({
    path             : CONFIG.localsearch.path,
    top_n_per_article: CONFIG.localsearch.top_n,
    unescape         : CONFIG.localsearch.unescape
});
if(CONFIG.localsearch.path){
    // 加载搜索数据
    localSearch.fetchData();
}else{
    console.warn('`hexo-generator-searchdb`插件未安装！');
}
function do_search(){
    if (!CONFIG.localsearch.path || !localSearch.isfetched) return;
    console.log('do search');
    const searchText = input.value.trim().toLowerCase();
    const keywords = searchText.split(/[-\s]+/);
    let resultItems = [];
    if (searchText.length > 0) {
      resultItems = localSearch.getResultItems(keywords);
    }
    if ((keywords.length === 1 && keywords[0] === '') || resultItems.length === 0) {
      container.innerHTML = '<div class="search-result-icon"><i class="fas fa-search">没有搜到相关文章~</i></div>';
    } else {
      resultItems.sort((left, right) => {
        if (left.includedCount !== right.includedCount) {
          return right.includedCount - left.includedCount;
        } else if (left.hitCount !== right.hitCount) {
          return right.hitCount - left.hitCount;
        }
        return right.id - left.id;
      });
      container.innerHTML = `<div class="search-stats">结果数：${resultItems.length}</div>
        <hr>
        <ul class="search-result-list">${resultItems.map(result => result.item).join('')}</ul>`;
    }
}
//==========右侧导航菜单==========
$(".btn-showmenu").click(function(){
    $(".right-navs").css("display","block");
});
$(".right-navs").click(function(){
    $(".right-navs").css("display","none");
});
$(".right-navs").on("click","nav", function(e){
    e.stopPropagation()
});
$(".right-navs .dropdown").click(function(){
    $(this).find(".dropdown-list").toggle();
});
//==========文章图片查看大图，https://github.com/fancyapps/fancybox==========
$('.article-content').find("img").each(function(i){
    let href = $(this).attr("src");
    let caption = $(this).attr("title");
    caption = caption?` data-caption="${caption}"`:"";
    $(this).wrap(`<a href="${href}" data-fancybox="gallery"${caption}></a>`);
});
//==========分类首页目录切换==========
// 加载页面数据
function loadCategory(arr) {
    $("#cate-list").html("");
    for(let item of arr){
        let icon = `<i class="far fa-folder-open" aria-hidden="true"></i>`;
        if(item.children.length > 0){
            icon = `<i class="fas fa-folder" aria-hidden="true" onclick="loadCategoryId('${item.id}')"></i>`;
        }
        $("#cate-list").append(`<div class="cate-item">${icon}
        <a href="${item.path}" class="nowrap" title="${item.name}(${item.length})">${item.name}<sup>${item.length}</sup></a>
        </div>`);
    }
}
// 递归遍历分类信息
function traverseCategory(arr, cid, idPath, callback){
    for(let category of arr){
        if(category.id===cid){
            idPath.push(`<a onclick="loadCategoryId('${category.id}')">${category.name}</a>`);
            callback(idPath, category.children);
        }else if(category.children.length > 0){
            idPath.push(`<a onclick="loadCategoryId('${category.id}')">${category.name}</a>`);
            traverseCategory(category.children, cid, idPath, callback);
        }
    }
}
// 查找category id并加载
function loadCategoryId(cid){
    if(!cid){
        $("#child-folder").html("");
        loadCategory(CATEGORY_DATA);
        return;
    }
    traverseCategory(CATEGORY_DATA, cid, [], function(idPath, cateArr){
        $("#child-folder").html(idPath.join("/"));
        loadCategory(cateArr);
    });
}
//==========切换网站样式配置==========
function change_theme() {
    document.body.classList.toggle('theme-grid');
}