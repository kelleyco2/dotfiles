local g = vim.g
local map = vim.keymap.set

g.VimuxOrientation = "h"
g.VimuxHeight = "50"

g["test#preserve_screen"] = false
g.neomake_open_list = true
g["test#strategy"] = {
	nearest = "vimux",
	file = "vimux",
	suite = "vimux",
}
g["test#neovim#term_position"] = "vert"
g.dispatch_compilers = { elixir = "exunit" }
g["test#javascript#runner"] = "jest"
g["test#javascript#jest#executable"] = "yarn workspace ui jest"

map("n", "<leader>tt", "<CMD>TestFile<CR>")
map("n", "<leader>tT", "<CMD>TestFile -strategy=neomake<CR>")
map("n", "<leader>tn", "<CMD>TestNearest<CR>")
map("n", "<leader>tN", "<CMD>TestNearest -strategy=neomake<CR>")
map("n", "<leader>t.", "<CMD>TestLast<CR>")
map("n", "<leader>tv", "<CMD>TestVisit<CR>zz")
map("n", "<leader>tV", "<CMD>vsplit+A<CR>")
map("n", "<leader>ts", "<CMD>TestSuite<CR>")
map("n", "<leader>tS", "<CMD>TestSuite -strategy=neomake<CR>")
map("n", "<leader>tc", "<CMD>VimuxCloseRunner<CR>")
