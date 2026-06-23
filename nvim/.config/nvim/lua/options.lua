--[[
┌────────────────────────────┐
│░█▀█░█▀█░▀█▀░▀█▀░█▀█░█▀█░█▀▀│
│░█░█░█▀▀░░█░░░█░░█░█░█░█░▀▀█│
│░▀▀▀░▀░░░░▀░░▀▀▀░▀▀▀░▀░▀░▀▀▀│
└────────────────────────────┘

A place to set Neovim options.

Neovim has a lot of options to affect editor behavior. Things like showing line
numbers, converting tabs to spaces, etc. All of them can be seen at `:help
option-summary`.

For any option shown below you can get to its docs directly by typing its name
in quotes. For example:

vim.opt.number = true

`:help 'number'`
--]]

-- show line numbers
vim.opt.number = true
-- use 24-bit RGB colors (your terminal must support this to work - most modern ones do)
vim.opt.termguicolors = true
-- how many spaces should a tab be
vim.opt.tabstop = 2
vim.opt.softtabstop = 2
vim.opt.shiftwidth = 2
vim.opt.smartindent = true
vim.opt.autoindent = true
vim.opt.completeopt = { "menu", "menuone", "noselect" }

-- The "Leader key" is a way of extending the power of VIM's shortcuts by using sequences of keys to perform a command.
-- The default leader key is backslash. Therefore, if you have a map of <Leader>Q, you can perform that action by typing \Q.
-- see `:help <leader>`
vim.g.mapleader = " "

vim.opt.splitbelow = true
vim.opt.splitright = true
vim.opt.clipboard = "unnamed"
vim.opt.cursorline = true
-- vim.opt.statuscolumn = "%{v:relnum?v:relnum:v:lnum}%=%s"
vim.opt.signcolumn = "yes"

vim.wo.relativenumber = true
vim.opt.conceallevel = 1

vim.g.copilot_filetypes = { gitcommit = true }

-- Auto-reload files changed on disk (e.g. edits the agent makes while a buffer
-- is open). Pairs with tmux `focus-events on`.
vim.opt.autoread = true
vim.api.nvim_create_autocmd({ "FocusGained", "BufEnter", "CursorHold", "CursorHoldI", "TermLeave" }, {
	callback = function()
		if vim.fn.mode() ~= "c" and vim.fn.getcmdwintype() == "" then
			vim.cmd("checktime")
		end
	end,
})
vim.api.nvim_create_autocmd("FileChangedShellPost", {
	callback = function()
		vim.notify("File reloaded — changed on disk", vim.log.levels.WARN)
	end,
})
