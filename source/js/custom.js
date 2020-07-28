function wait(callback, seconds) {
    var timelag = null;
    timelag = window.setTimeout(callback, seconds);
}
// 复制代码按钮
var initCopyCode = function(){
    var copyHtml = '';
    copyHtml += '<button class="btn-copy" data-clipboard-snippet="">';
    copyHtml += '<i class="fas fa-copy"></i><span>复制</span>';
    copyHtml += '</button>';
    $(".highlight .code pre").before(copyHtml);
    // $(".article pre code").before(copyHtml);
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
    $span[0].innerText = '复制完成';
    
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
    $span[0].innerText = '复制失败';
    
    wait(function () { // 等待两秒钟后恢复
        $icon.removeClass('fa-times-circle');
        $icon.addClass('fa-copy');
        $span[0].innerText = '复制';
    }, 2000);
    });
}
//加载页面后自动调用方法
var onload_content = function(){
    //查看大图
    $('.article-entry').each(function(i){
        $(this).find('>p img,>ol img,>ul img,>dl img,>blockquote img').each(function(){
            if ($(this).parent().hasClass('fancybox')) return;
            var alt = this.alt;
            if (alt) $(this).after('<span class="caption">' + alt + '</span>');
            $(this).wrap('<a href="' + this.src + '" title="' + alt + '" class="fancybox"></a>');
        });
        $(this).find('.fancybox').each(function(){
            $(this).attr('rel', 'article' + i);
        });
    });
    if ($.fancybox){
        $('.fancybox').fancybox();
    }
    //创建复制按钮
    initCopyCode();
    //修改加密文章标题前图标状态
    if($('.article-entry').length > 0){//index不改变
        $('.fa-lock').each(function(i){
            $(this).removeClass('fa-lock');
            $(this).addClass('fa-unlock-alt');
        });
    }
}
