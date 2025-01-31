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

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}