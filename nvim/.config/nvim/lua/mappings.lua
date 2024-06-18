vim.keymap.set({ "n", "v" }, ";", ":")
vim.keymap.set({ "n", "v" }, ":", ";")
vim.keymap.set("n", "n", "nzz")
vim.keymap.set("n", "N", "Nzz")
vim.keymap.set("n", "<C-o>", "<C-o>zz")
vim.keymap.set("n", "<C-i>", "<C-i>zz")
vim.keymap.set("n", "*", "*zz")
vim.keymap.set("n", "#", "#zz")
vim.keymap.set("n", "<leader>,", ":nohlsearch<CR>")
vim.keymap.set("n", "<bs>", ":b#<CR>")
vim.keymap.set("n", "<UP>", "<CMD>cope<CR>")
vim.keymap.set("n", "<DOWN>", "<CMD>cclose<CR>")
vim.keymap.set("n", "<RIGHT>", "<CMD>cnext<CR>")
vim.keymap.set("n", "<LEFT>", "<CMD>cprev<CR>")
vim.keymap.set("n", "<leader>s", "<CMD>Neoformat | :w<CR>")
vim.keymap.set("n", "<leader>w", "<CMD>q<CR>")
vim.keymap.set("n", "<leader>q", ":q<CR>")
vim.keymap.set("n", "<leader>|", ":vsplit<CR>")
vim.keymap.set("n", "<leader>E", "<CMD>NnnExplorer<CR>")
vim.keymap.set("n", "<leader>e", "<CMD>NnnPicker %:p<CR>")

vim.keymap.set("n", "<leader>gg", "<CMD>G<CR>")
vim.keymap.set("n", "<leader>gl", "<CMD>Gclog<CR>")
vim.keymap.set("n", "<leader>gh", "<CMD>0Gclog<CR>")
vim.keymap.set("n", "<leader>gd", "<CMD>Gvdiffsplit<CR>")
vim.keymap.set("n", "<leader>ty", "<CMD>TSC<CR>")
vim.keymap.set("n", "<leader>l", "<CMD>Telescope lsp_document_symbols<CR>")

-- Buffers and bufferline
vim.keymap.set("n", "<leader>bb", "<CMD>Telescope buffers<CR>")
vim.keymap.set("n", "<leader>bon", "<CMD>BufferLineCloseOthers<CR>")
vim.keymap.set("n", "<leader>bc", "<CMD>BufferLinePick<CR>")
vim.keymap.set("n", "<leader>bq", "<CMD>BufferLinePickClose<CR>")
vim.keymap.set("n", "<leader>bn", "<CMD>BufferLineCycleNext<CR>")
vim.keymap.set("n", "<leader>bp", "<CMD>BufferLineCyclePrev<CR>")
vim.keymap.set("n", "<leader>1", "<Cmd>BufferLineGoToBuffer 1<CR>")
vim.keymap.set("n", "<leader>2", "<Cmd>BufferLineGoToBuffer 2<CR>")
vim.keymap.set("n", "<leader>3", "<Cmd>BufferLineGoToBuffer 3<CR>")
vim.keymap.set("n", "<leader>4", "<Cmd>BufferLineGoToBuffer 4<CR>")
vim.keymap.set("n", "<leader>5", "<Cmd>BufferLineGoToBuffer 5<CR>")
vim.keymap.set("n", "<leader>6", "<Cmd>BufferLineGoToBuffer 6<CR>")
vim.keymap.set("n", "<leader>7", "<Cmd>BufferLineGoToBuffer 7<CR>")
vim.keymap.set("n", "<leader>8", "<Cmd>BufferLineGoToBuffer 8<CR>")
vim.keymap.set("n", "<leader>9", "<Cmd>BufferLineGoToBuffer 9<CR>")
vim.keymap.set("n", "<leader>$", "<Cmd>BufferLineGoToBuffer -1<CR>")

-- Pomodoro timers
vim.keymap.set("n", "<leader>pw", "<Cmd>TimerStart 25m Work<CR>")
vim.keymap.set("n", "<leader>pb", "<Cmd>TimerStart 5m Break<CR>")
vim.keymap.set("n", "<leader>pr", "<Cmd>TimerStart 30m Rest<CR>")
vim.keymap.set("n", "<leader>pp", "<Cmd>TimerPause<CR>")
vim.keymap.set("n", "<leader>ps", "<Cmd>TimerStop<CR>")

-- Copilot complete
vim.keymap.set("i", "<C-l>", 'copilot#Accept("\\<CR>")', {
	expr = true,
	replace_keycodes = false,
})
vim.g.copilot_no_tab_map = true
