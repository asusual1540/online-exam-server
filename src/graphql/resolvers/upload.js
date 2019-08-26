module.exports = {
    uploadFile: async (parent, { file }, ctx, info) => {
        try {
            console.log(file)
            return true
        } catch (ex) {
            console.log("Error")
            return false
        }
    }
}