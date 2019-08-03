const pool = require('../../pool')

exports.Mypage = (req, res) => {
    if (!req.session.sid) {
        res.redirect('/')
    } else {
        const sid = req.session.sid

        const UserCheck = async () => {
            try {
                const connection = await pool.getConnection(async conn => conn)
                try {
                    const [rows] = await connection.query(`SELECT * FROM USER WHERE UserId = ?`, [sid])
                    connection.release()
                    if(!rows[0]){
                        return Promise.reject({
                            code:'no_user',
                            message:'Cannot find user'
                        })
                    }
                    return Promise.resolve(rows)
                } catch (err) {
                    return Promise.reject({
                        code:'no_user',
                        message:'Cannot find user'
                    })
                }
            } catch (err) {
                return Promise.reject({
                    code:'database_connection_error',
                    message:'Failed to connect database'
                })
            }
        }
    
        UserCheck()
        .then((rows) => {
            req.session.sid = sid
            
            const status = rows[0].status
            const name = rows[0].name
            const numid = rows[0].numid

            res.render('mypage.ejs', {
                sid:sid,
                status:status,
                numid:numid,
                name:name,
            })
        })
        .catch((err) => {
            console.log(err)

            res.status(500).json(err | err.message)
        })
    }
}