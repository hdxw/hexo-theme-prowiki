/* global hexo */
/* locals => site */
'use strict';

function getMenuMap(menus) {
    let myMap = new Map();
    for (let menuName in menus){
        let menuPath = menus[menuName];
        if(typeof(menuPath)==='string' && !myMap.has(menuPath)){
            // console.log(menuName, menuPath);
            myMap.set(menuPath, menuName);
        }
    }
    return myMap;
}
let menuMap = getMenuMap(hexo.config.theme_config.menus);

// ====================================== helper ======================================

// 用于“归档archive”页面page.month & page.day前补0
hexo.extend.helper.register("zfill", function (val, len) {
    return (parseInt(val) < (10**(len-1)) ? '0'.repeat(len-(val+'').length) : '') + parseInt(val);
});
// 判断页面是否是archive的日分类目录
hexo.extend.helper.register("is_day", function () {
    if(!this.is_archive()) return false;
    return this.page.day && this.page.day > 0 && this.page.day <= 31;
});
// 生成标签气泡图数据
hexo.extend.helper.register("tag_series", function (sameColor=false) {
    // sameColor 气泡是否使用相同颜色(颜色按series划分)
    let data = [];
    this.site.tags.forEach(tag => {
        const { name, path, length } = tag;
        if(sameColor){
            data.push({name: name, value: length, path: this.url_for(path) });
        }else{
            data.push({data:[{name: name, value: length, path: this.url_for(path) }]});
        }
    });
    return JSON.stringify(sameColor ? [{data: data}] : data);
});
// 拼接html title
hexo.extend.helper.register("concat_title", function () {
    const { page, config, theme } = this;
    // let menuDirs = ['/', config.archive_dir, config.category_dir, config.tag_dir, themeCfg.friends.path]
    // let menuMap = getMenuMap(theme.menus);
    let title = page.title;
    if(this.is_home()){
        const menuDir = '/';
        title = menuMap.has(menuDir) ? menuMap.get(menuDir) : __('首页');
    }else if (this.is_archive()){
        const menuDir = config.archive_dir;
        title = menuMap.has(menuDir) ? menuMap.get(menuDir) : __('归档');
        title += this.is_year()? (':' + page.year) : '';
        title += this.is_month()? ('/' + this.zfill(page.month,2)) : '';
        title += this.is_day()? ('/' + this.zfill(page.day,2)) : '';
    }else if(page.path.indexOf(config.category_dir+'/')===0){
        const menuDir = config.category_dir;
        // console.log(menuMap.get(menuDir));
        title = menuMap.has(menuDir) ? menuMap.get(menuDir) : __('分类');
        title += this.is_category() ? (':' + page.category) : '';
    }else if(page.path.indexOf(config.tag_dir+'/')===0){
        const menuDir = config.tag_dir;
        // console.log(menuMap.get(menuDir));
        title = menuMap.has(menuDir) ? menuMap.get(menuDir) : __('标签');
        title += this.is_tag() ? (':' + page.tag) : '';
    }else if(page.path.indexOf(theme.friends.path+'/')===0){
        const menuDir = theme.friends.path;
        title = menuMap.has(menuDir) ? menuMap.get(menuDir) : __('友链');
    }
    return (title ? (title + ' | '):'') + config.title;
});

// ====================================== generator ======================================

function traverseTree(cateMap, childMap, id){
    let result = [];
    if(!childMap.has(id)) return result;

    for(let childId of childMap.get(id)){
        let child = cateMap.get(childId);
        if(childMap.has(childId)){
            child.children = traverseTree(cateMap, childMap, childId);
        }
        result.push(child);
    }
    return result;
}

// 分类没有首页，自动生成
if(menuMap.has(hexo.config.category_dir)){
    hexo.extend.generator.register("category-index", function (locals) {
        const url_for = hexo.extend.helper.get("url_for").bind(hexo);

        let categoryMap = new Map();
        let childrenMap = new Map();
        locals.categories.forEach(category => {
            const { _id, name, parent, slug, path, length } = category;
            categoryMap.set(_id, { id:_id, name:name, parent:parent, slug:slug, path:url_for(path), length:length, children:[] });
            let children = childrenMap.has(parent) ? childrenMap.get(parent): [];
            children.push(_id);
            childrenMap.set(parent, children);
        });

        let result = [];
        for (let [id, item] of categoryMap) {
            if(!item.parent){
                item.children = traverseTree(categoryMap, childrenMap, id);
                result.push(item);
            }
        }
        locals.categoryStr = JSON.stringify(result);
        return {
            path: this.config.category_dir+"/index.html",
            data: locals,
            layout: ["category-index"],
        };
    });
}
// 自定义“友链”模板，单页面
if(hexo.config.theme_config.friends.enable && menuMap.has(hexo.config.theme_config.friends.path)){
    hexo.extend.generator.register("friend", function (locals) {
      const { config: themeCfg } = this.theme;
      const linkMap = new Map();
      for(let i = 0,len=themeCfg.friends.groups.length; i < len; i++){
        let group_name = themeCfg.friends.groups[i].group;
        if(linkMap.has(group_name)){
          linkMap.set(group_name, linkMap.get(group_name).concat(themeCfg.friends.groups[i].items));
        }else{
          linkMap.set(group_name, themeCfg.friends.groups[i].items);
        }
      }
      // TODO 支持page中头部参数配置友链
      locals.friends = linkMap;
      // locals => page
      return {
        path: themeCfg.friends.path+"/index.html",
        data: locals,
        layout: ["friend"],
      };
    });
}

// ====================================== filter ======================================

// 文章部分属性值修改
hexo.extend.filter.register("before_post_render", function (data) {
    const { config: themeCfg } = this.theme;
    // 增加author
    let author = data.author?data.author:''; // 文章头部主动添加
    if(author===''){
        for(let key in themeCfg.authors){
            author = key;
            break;
        }
    }
    data.author = author;
    return data;
});
// 代码段自动添加复制按钮，比加密插件执行要早(priority<1000)
hexo.extend.filter.register("after_post_render", function (data) {
    var copyHtml = '<button class="btn-copy" data-clipboard-snippet=""><i class="fas fa-copy"></i><span>复制</span></button>';
    data.content = data.content.replaceAll(/<td class="code"><pre><code/g, '<td class="code"><pre>'+copyHtml+'<code');
    return data;
}, 999);
// 版权声明附加到content末尾，防止出现hexo-plugin-gitalk等同样附加内容的插件(默认priority=10)在版权声明之上的情况
hexo.extend.filter.register("after_post_render", function (data) {
    const { config: themeCfg } = this.theme;
    if(themeCfg.copyright.enable && (data.copyright==null || data.copyright)){
        let statement = themeCfg.copyright.content.join("<br>");
        statement = statement.replace(new RegExp(":permalink","gm"), data.permalink);
        statement = statement.replace(new RegExp(":author","gm"), data.author);// author属性为上面添加的
        data.content = data.content + `<blockquote><p>${statement}</p></blockquote>`;
    }
    return data;
}, 1);