const User = require('../models/users');
const express = require('express');
const multer = require('multer');
const path = require('path')
const router = express.Router();
const fs = require('fs').promises;

// Image Uploads
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single("image");

// Insert an user database route
router.post('/add-user', upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });
    user.save()
        .then(() => {
            req.session.message = {
                type: "success",
                message: "User berhasil ditambahkan",
            };
            res.redirect("/users");
        })
        .catch(err => {
            res.json({ message: err.message });
        });
});

// Get all data
router.get('/users', (req, res) => {
    User.find().exec()
        .then(users => {
            res.render("index", {
                title: "Home page",
                users: users,
            });
        }).catch(err => {
            res.json({ message: err.message, type: 'danger' });
        });
});


router.get('/add-user', (req, res) => {
    res.render('create', { title: "Halaman User" })
});

router.get('/edit/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const users = await User.findById(id).exec();

        if (users === null) {
            res.redirect("/");
        } else {
            res.render("edit", {
                title: "Edit user",
                users: users,
            });
        }
    } catch (err) {
        console.error(err);
        res.redirect("/");
    }
});

// Update
router.post("/update/:id", upload, (req, res) => {
    let id = req.params.id;
    let new_image = "";

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync("./uploads" + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image,
    }).then((result) => {
        req.session.message = {
            type: 'success',
            message: 'User berhasil diubah',
        };
        res.redirect('/users')
    })
        .catch(err => {
            res.json({ message: err.message, type: 'danger' });
        });
})

// Delete
// router.get("/delete/:id", (req, res) => {
//     let id = req.params.id;
//     User.findByIdAndDelete(id, (err, result) => {
//         if (result.image != "") {
//             try {
//                 fs.unlinkSync("./uploads/" + result.image);
//             } catch (err) {
//                 console.log(err);
//             }
//         }

//         if (err) {
//             res.json({ message: err.message, type: 'danger' });
//         } else {
//             req.session.message = {
//                 type: 'info',
//                 message: 'User berhasil dihapus',
//             };
//             res.redirect('/users');
//         }
//     });
// })

router.get("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await User.findByIdAndDelete(id);

        // Hapus file gambar jika ada
        if (result.image && result.image !== "") {
            const imagePath = path.join(__dirname, '../uploads', result.image);
            await fs.unlink(imagePath);
            console.log('File gambar dihapus:', imagePath);
        }

        req.session.message = {
            type: 'info',
            message: 'User berhasil dihapus',
        };
        res.redirect('/users');
    } catch (err) {
        console.error('Error deleting user:', err);
        res.json({ message: err.message, type: 'danger' });
    }
});


module.exports = router;