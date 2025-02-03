const lodash = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((accumulator, currentValue) => accumulator + currentValue.likes, 0)
}

const favoriteBlog = (blogs) => {
    let favorite = { likes: 0 }
    blogs.forEach(blog => {
        blog.likes > favorite.likes ? favorite = blog : favorite
    });
    return favorite
}

const mostBlogs = (blogs) => {
    const groupedByAuthor = lodash.groupBy(blogs, 'author')
    const authorBlogCounts = lodash.mapValues(groupedByAuthor, (authorBlogs) => authorBlogs.length)
    const maxBlogsAuthor = lodash.maxBy(lodash.keys(authorBlogCounts), (author) => authorBlogCounts[author])
    return {
        author: maxBlogsAuthor,
        blogs: authorBlogCounts[maxBlogsAuthor]
    }
}

const mostLikes = (blogs) => {
    const groupedByAuthor = lodash.groupBy(blogs, 'author')
    const authorLikeCounts = lodash.mapValues(groupedByAuthor, (authorBlogs) => lodash.sumBy(authorBlogs, 'likes'))
    const maxLikesAuthor = lodash.maxBy(lodash.keys(authorLikeCounts), (author) => authorLikeCounts[author])    
    return {
        author: maxLikesAuthor,
        likes: authorLikeCounts[maxLikesAuthor]
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}